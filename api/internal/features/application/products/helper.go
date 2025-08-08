package products

import (
	"database/sql"
	"encoding/json"
	"mime/multipart"
	"time"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

// REPOSITORY HELPERS
func (r *Repository) invalidateProductCaches(productID, inventoryID uuid.UUID) {
	r.cache.Delete(productCacheKey(productID))
	r.cache.Delete(productListCacheKey(inventoryID))
	r.cache.Delete(categoryListCacheKey(inventoryID))
}

func (r *Repository) handleProductCategories(tx *sqlx.Tx, productID, inventoryID uuid.UUID, categories []string) error {
	if len(categories) == 0 {
		return nil
	}

	for _, categoryName := range categories {
		//Find existing category
		var categoryID uuid.UUID
		getQuery := `SELECT id FROM product_categories WHERE name = $1 AND inventory_id = $2`

		err := tx.Get(&categoryID, getQuery, categoryName, inventoryID)
		if err == sql.ErrNoRows {
			// Create new category if it doesn't exist
			addQuery := `INSERT INTO product_categories (id, name, inventory_id, created_at, updated_at) 
						 VALUES (:id, :name, :inventory_id, :created_at, :updated_at)`

			newCategory := &models.ProductCategory{
				ID:          uuid.New(),
				Name:        categoryName,
				InventoryID: inventoryID,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			_, err = tx.NamedExec(addQuery, newCategory)
			if err != nil {
				return errors.DatabaseError(err, "Error creating category")
			}
			categoryID = newCategory.ID
		} else if err != nil {
			return errors.DatabaseError(err, "Error finding category")
		}

		// Link category to product
		mapQuery := `INSERT INTO product_category_link (product_id, category_id) 
					 VALUES (:product_id, :category_id)`

		categoryMap := &models.ProductCategoryLink{
			ProductID:  productID,
			CategoryID: categoryID,
		}

		_, err = tx.NamedExec(mapQuery, categoryMap)
		if err != nil {
			return errors.DatabaseError(err, "Error linking product to category")
		}
	}

	return nil
}

func (r *Repository) updateProductCategories(tx *sqlx.Tx, productID, inventoryID uuid.UUID, categories []string) error {
	// Remove existing category links
	if _, err := tx.Exec(`DELETE FROM product_category_link WHERE product_id = $1`, productID); err != nil {
		return errors.DatabaseError(err, "Error removing existing category links")
	}

	// Add new links if categories are provided
	if len(categories) > 0 {
		return r.handleProductCategories(tx, productID, inventoryID, categories)
	}
	return nil
}

func (r *Repository) loadProductImages(product *models.Product) error {
	var images []models.ProductImage
	err := r.db.Select(&images, `
		SELECT * FROM product_images 
		WHERE product_id = $1 
		ORDER BY is_primary DESC, created_at ASC
	`, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error fetching product images")
	}
	product.Images = images
	return nil
}

func (r *Repository) loadProductCategories(product *models.Product) error {
	var categories []models.ProductCategory
	err := r.db.Select(&categories, `
		SELECT pc.* FROM product_categories pc
		JOIN product_category_link pcm ON pc.id = pcm.category_id
		WHERE pcm.product_id = $1
	`, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error fetching product categories")
	}
	product.Categories = categories
	return nil
}

func (r *Repository) loadWarehouseStock(product *models.Product) error {
	var warehouses []models.WarehouseWithStock
	query := `
        SELECT 
            w.id, w.name, w.location, w.capacity, w.storage_type,
            w.is_main, w.manager, w.phone, w.email,
            w.created_at, w.updated_at, 
            wpl.quantity_in_stock
        FROM warehouse_product_link wpl
        JOIN warehouses w ON wpl.warehouse_id = w.id
        WHERE wpl.product_id = $1
    `
	err := r.db.Select(&warehouses, query, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error fetching warehouse stock")
	}

	product.Storages = mapper.ToWarehouseStock(warehouses)
	return nil
}

// CONTROLLER HELPERS
func (c *Controller) parseProductRequest(ctx echo.Context) (models.ProductRequest, error) {
	var req models.ProductRequest

	// Parse product metadata
	productData := ctx.FormValue("productData")
	if productData == "" {
		return req, errors.ValidationError("Missing productData field")
	}

	if err := json.Unmarshal([]byte(productData), &req); err != nil {
		return req, errors.ValidationError("Invalid JSON in productData field")
	}

	// Parse multipart form data / image requests
	form, err := ctx.MultipartForm()
	if err != nil {
		return req, errors.ValidationError("Failed to parse multipart form")
	}

	if files, exists := form.File["newImages"]; exists {
		req.NewImages = make([]*multipart.FileHeader, len(files))
		copy(req.NewImages, files)
	}

	if existing := ctx.FormValue("existingImages"); existing != "" {
		var existingImages []models.ProductImageRequest
		if err := json.Unmarshal([]byte(existing), &existingImages); err != nil {
			return req, errors.ValidationError("Invalid JSON in existingImages field")
		}
		req.ExistingImages = existingImages
	}

	return req, nil
}

func (c *Controller) uploadProductImages(ctx echo.Context, productID uuid.UUID, newImages []*multipart.FileHeader) error {
	for i, file := range newImages {
		uploadResult, err := c.bucket.UploadFile(file)
		if err != nil {
			return logger.Error(ctx, "Failed to upload product image", err, logrus.Fields{
				"product_id": productID,
			})
		}

		image := &models.ProductImage{
			ID:        uuid.New(),
			URL:       uploadResult.URL,
			Name:      uploadResult.Name,
			FileKey:   uploadResult.FileKey,
			IsPrimary: i == 0, // First image is primary
			ProductID: productID,
			CreatedAt: time.Now(),
		}

		if err := c.repo.CreateProductImage(image); err != nil {
			// Clean up uploaded file if database save fails
			c.bucket.DeleteFile(uploadResult.FileKey)
			return logger.Error(ctx, "Failed to save image record", err, logrus.Fields{
				"product_id": productID,
				"file_key":   uploadResult.FileKey,
			})
		}
	}

	return nil
}

func (c *Controller) updateProductImages(ctx echo.Context, productID uuid.UUID, newImages []*multipart.FileHeader, existingImages []models.ProductImageRequest) error {
	currentImages, err := c.repo.GetProductImages(productID)
	if err != nil {
		return logger.Error(ctx, "Failed to get current product images", err, logrus.Fields{
			"product_id": productID,
		})
	}

	// Delete all product images if existing and new images are empty
	if len(existingImages) == 0 && len(newImages) == 0 {
		if len(currentImages) > 0 {
			fileKeys := make([]string, len(currentImages))
			for i, img := range currentImages {
				fileKeys[i] = img.FileKey
			}

			if err := c.bucket.DeleteFiles(fileKeys); err != nil {
				logger.Error(ctx, "Failed to delete images from R2", err, logrus.Fields{
					"product_id": productID,
					"file_keys":  fileKeys,
				})
			}

			for _, img := range currentImages {
				if err := c.repo.DeleteProductImage(img.ID); err != nil {
					return logger.Error(ctx, "Failed to delete image record", err, logrus.Fields{
						"product_id": productID,
						"image_id":   img.ID,
					})
				}
			}
		}
		return nil
	}

	// Delete any removed images from existing images
	if len(existingImages) > 0 {
		existingImageMap := make(map[string]bool)
		for _, img := range existingImages {
			existingImageMap[img.ID] = true
		}

		var imagesToDelete []models.ProductImage
		var fileKeysToDelete []string

		for _, img := range currentImages {
			if !existingImageMap[img.ID.String()] {
				imagesToDelete = append(imagesToDelete, img)
				fileKeysToDelete = append(fileKeysToDelete, img.FileKey)
			}
		}

		if len(imagesToDelete) > 0 {
			if err := c.bucket.DeleteFiles(fileKeysToDelete); err != nil {
				logger.Error(ctx, "Failed to delete images from R2", err, logrus.Fields{
					"product_id": productID,
					"file_keys":  fileKeysToDelete,
				})
			}

			for _, img := range imagesToDelete {
				if err := c.repo.DeleteProductImage(img.ID); err != nil {
					return logger.Error(ctx, "Failed to delete image record", err, logrus.Fields{
						"product_id": productID,
						"image_id":   img.ID,
					})
				}
			}
		}
	}

	// Upload new images provided
	if len(newImages) > 0 {
		if err := c.uploadProductImages(ctx, productID, newImages); err != nil {
			return err
		}
	}

	return nil
}
