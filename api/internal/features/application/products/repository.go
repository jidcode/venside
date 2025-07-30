package products

import (
	"database/sql"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type Repository struct {
	db    *sqlx.DB
	cache cache.RedisService
}

func NewRepository(db *sqlx.DB, cache cache.RedisService) ProductRepository {
	return &Repository{db: db, cache: cache}
}

func productCacheKey(ID uuid.UUID) string {
	return "product:" + ID.String()
}

func productListCacheKey(inventoryID uuid.UUID) string {
	return "products:" + inventoryID.String()
}

func categoryListCacheKey(inventoryID uuid.UUID) string {
	return "categories:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour // 30 days
)

// Product operations
func (r *Repository) ListProducts(inventoryID uuid.UUID) ([]models.Product, error) {
	key := productListCacheKey(inventoryID)

	var cachedProducts []models.Product
	if err := r.cache.Get(key, &cachedProducts); err == nil {
		return cachedProducts, nil
	}

	query := `SELECT * FROM products WHERE inventory_id = $1 ORDER BY created_at DESC`
	products := []models.Product{}

	err := r.db.Select(&products, query, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching products")
	}

	if err := r.cache.Set(key, products, TTL); err != nil {
		return products, errors.CacheError(err, "Error caching products")
	}

	return products, nil
}

func (r *Repository) GetProduct(productID uuid.UUID) (models.Product, error) {
	key := productCacheKey(productID)

	var cachedProduct models.Product
	if err := r.cache.Get(key, &cachedProduct); err == nil {
		return cachedProduct, nil
	}

	var product models.Product
	query := `SELECT * FROM products WHERE id = $1`

	err := r.db.Get(&product, query, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			return product, errors.NotFoundError("Product not found")
		}
		return product, errors.DatabaseError(err, "Error getting product by ID")
	}

	if err := r.cache.Set(key, product, TTL); err != nil {
		return product, errors.CacheError(err, "Error caching product")
	}

	return product, nil
}

func (r *Repository) GetProductWithDetails(productID uuid.UUID) (models.Product, error) {
	product, err := r.GetProduct(productID)
	if err != nil {
		return product, err
	}

	// Images
	var images []models.ProductImage
	err = r.db.Select(&images, `
		SELECT * FROM product_images 
		WHERE product_id = $1 
		ORDER BY is_primary DESC, created_at ASC
	`, productID)
	if err != nil {
		return product, errors.DatabaseError(err, "Error fetching product images")
	}
	product.Images = images

	// Categories
	var categories []models.ProductCategory
	err = r.db.Select(&categories, `
		SELECT pc.* FROM product_categories pc
		JOIN product_category_link pcm ON pc.id = pcm.category_id
		WHERE pcm.product_id = $1
	`, productID)
	if err != nil {
		return product, errors.DatabaseError(err, "Error fetching product categories")
	}
	product.Categories = categories

	// Warehouses
	var warehousesWithStock []models.WarehouseWithStock
	query := `
		SELECT 
			w.id, w.name, w.location, w.capacity, w.storage_type,
			w.manager, w.contact, w.created_at,	w.updated_at, 
			wpl.stock_quantity
		FROM warehouse_product_link wpl
		JOIN warehouses w ON wpl.warehouse_id = w.id
		WHERE wpl.product_id = $1
	`
	err = r.db.Select(&warehousesWithStock, query, productID)
	if err != nil {
		return product, errors.DatabaseError(err, "Error fetching warehouse stock")
	}

	var storages []models.Storage
	for _, wws := range warehousesWithStock {
		storages = append(storages, models.Storage{
			ProductID:     productID,
			WarehouseID:   wws.ID,
			StockQuantity: wws.StockQuantity,
			Warehouse: models.Warehouse{
				ID:          wws.ID,
				Name:        wws.Name,
				Location:    wws.Location,
				Capacity:    wws.Capacity,
				StorageType: wws.StorageType,
				Manager:     wws.Manager,
				Contact:     wws.Contact,
				CreatedAt:   wws.CreatedAt,
				UpdatedAt:   wws.UpdatedAt,
			},
		})
	}
	product.Storages = storages

	return product, nil
}

func (r *Repository) CreateProduct(product *models.Product, categories []string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	query := `
        INSERT INTO products (
            id, name, code, sku, brand, model, description,
            total_quantity, restock_level, optimal_level,
            cost_price, selling_price, inventory_id,
            created_at, updated_at
        ) VALUES (
            :id, :name, :code, :sku, :brand, :model, :description,
            :total_quantity, :restock_level, :optimal_level,
            :cost_price, :selling_price, :inventory_id,
            :created_at, :updated_at
        )
    `
	_, err = tx.NamedExec(query, product)
	if err != nil {
		return errors.DatabaseError(err, "Error creating product")
	}

	err = r.handleProductCategories(tx, product.ID, product.InventoryID, categories)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateProductCaches(product.ID, product.InventoryID)
	return nil
}

func (r *Repository) UpdateProduct(product *models.Product, categories []string) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	// Update basic product details
	query := `
		UPDATE products SET 
			name = :name,
			code = :code,
			sku = :sku,
			brand = :brand,
			model = :model,
			description = :description,
			total_quantity = :total_quantity,
			restock_level = :restock_level,
			optimal_level = :optimal_level,
			cost_price = :cost_price,
			selling_price = :selling_price,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err = tx.NamedExec(query, product)
	if err != nil {
		return errors.DatabaseError(err, "Error updating product")
	}

	// Always remove existing category links
	deleteQuery := `DELETE FROM product_category_link WHERE product_id = $1`
	_, err = tx.Exec(deleteQuery, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error removing existing category links")
	}

	// Only add new links if categories are provided
	if len(categories) > 0 {
		err = r.handleProductCategories(tx, product.ID, product.InventoryID, categories)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateProductCaches(product.ID, product.InventoryID)
	return nil
}

func (r *Repository) DeleteProduct(productID uuid.UUID) error {
	product, err := r.GetProduct(productID)
	if err != nil {
		return err
	}

	query := `DELETE FROM products WHERE id = $1`
	_, err = r.db.Exec(query, productID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting product")
	}

	r.invalidateProductCaches(productID, product.InventoryID)

	return nil
}

func (r *Repository) DeleteMultipleProducts(productIDs []uuid.UUID, inventoryID uuid.UUID) error {
	if len(productIDs) == 0 {
		return nil
	}

	query := `DELETE FROM products WHERE id = ANY($1)`

	_, err := r.db.Exec(query, pq.Array(productIDs))
	if err != nil {
		return errors.DatabaseError(err, "Error deleting multiple products")
	}

	for _, productID := range productIDs {
		r.cache.Delete(productCacheKey(productID))
	}

	r.cache.Delete(productListCacheKey(inventoryID))
	r.cache.Delete(categoryListCacheKey(inventoryID))

	return nil
}

// Category operations
func (r *Repository) ListProductCategories(inventoryID uuid.UUID) ([]models.ProductCategory, error) {
	key := categoryListCacheKey(inventoryID)

	var cachedCategories []models.ProductCategory
	if err := r.cache.Get(key, &cachedCategories); err == nil {
		return cachedCategories, nil
	}

	query := `SELECT * FROM product_categories WHERE inventory_id = $1 ORDER BY name ASC`
	categories := []models.ProductCategory{}

	err := r.db.Select(&categories, query, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching categories")
	}

	if err := r.cache.Set(key, categories, TTL); err != nil {
		return categories, errors.CacheError(err, "Error caching categories")
	}

	return categories, nil
}

// Image operations
func (r *Repository) GetProductImages(productID uuid.UUID) ([]models.ProductImage, error) {
	images := []models.ProductImage{}
	query := `SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, created_at ASC`

	err := r.db.Select(&images, query, productID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Get Product Images")
	}

	return images, nil
}

func (r *Repository) GetImagesOfMultipleProducts(productIDs []uuid.UUID) ([]models.ProductImage, error) {
	if len(productIDs) == 0 {
		return nil, nil
	}

	query := `SELECT file_key FROM product_images WHERE product_id = ANY($1)`

	var images []models.ProductImage
	err := r.db.Select(&images, query, pq.Array(productIDs))
	if err != nil {
		return nil, errors.DatabaseError(err, "Error getting multiple product images")
	}

	return images, nil
}

func (r *Repository) CreateProductImage(image *models.ProductImage) error {
	query := `INSERT INTO product_images (
				id, url, name, file_key, is_primary, product_id, created_at
			) VALUES (
				:id, :url, :name, :file_key, :is_primary, :product_id, :created_at)`

	_, err := r.db.NamedExec(query, image)
	if err != nil {
		return errors.DatabaseError(err, "Create Product Image")
	}

	return nil
}

func (r *Repository) DeleteProductImage(imageID uuid.UUID) error {
	query := `DELETE FROM product_images WHERE id = $1`

	_, err := r.db.Exec(query, imageID)
	if err != nil {
		return errors.DatabaseError(err, "Delete Product Image")
	}

	return nil
}

func (r *Repository) SetPrimaryImage(imageID, inventoryID uuid.UUID) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Begin transaction for SetPrimaryImage")
	}

	// get the product ID for this image
	var productID uuid.UUID
	getProductQuery := `SELECT product_id FROM product_images WHERE id = $1`
	err = tx.Get(&productID, getProductQuery, imageID)
	if err != nil {
		tx.Rollback()
		return errors.DatabaseError(err, "Get product ID for image")
	}

	// Reset all images, then set specified image to primary
	resetPrimaryQuery := `UPDATE product_images SET is_primary = false WHERE product_id = $1`
	_, err = tx.Exec(resetPrimaryQuery, productID)
	if err != nil {
		tx.Rollback()
		return errors.DatabaseError(err, "Reset primary images")
	}

	setPrimaryQuery := `UPDATE product_images SET is_primary = true WHERE id = $1`
	_, err = tx.Exec(setPrimaryQuery, imageID)
	if err != nil {
		tx.Rollback()
		return errors.DatabaseError(err, "Set primary image")
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return errors.DatabaseError(err, "Commit transaction for SetPrimaryImage")
	}

	r.invalidateProductCaches(productID, inventoryID)

	return nil
}
