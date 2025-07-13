package products

import (
	"net/http"
	"time"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/internal/shared/utils"
	"github.com/app/venside/pkg/cloudflare"
	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Controller struct {
	repo      ProductRepository
	validator *ProductValidator
	bucket    *cloudflare.R2Client
}

func NewController(
	repo ProductRepository,
	validator *ProductValidator,
	bucket *cloudflare.R2Client,
) ProductController {
	return &Controller{
		repo:      repo,
		validator: validator,
		bucket:    bucket,
	}
}

func (c *Controller) ListProducts(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	products, err := c.repo.ListProducts(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch products", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.ProductResponse, len(products))
	for i, product := range products {
		response[i] = *mapper.ToProductResponse(&product)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	product, err := c.repo.GetProductWithDetails(productID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve product", err, logrus.Fields{
			"product_id": productID,
		})
	}

	response := mapper.ToProductResponse(&product)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateProduct(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.ProductRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newProduct := mapper.ToCreateProduct(&req, inventoryID)

	if err := c.validator.ValidateProduct(newProduct); err != nil {
		return err
	}

	err = c.repo.CreateProduct(newProduct, req.Categories, req.Storages)
	if err != nil {
		return logger.Error(ctx, "Failed to create product", err, logrus.Fields{
			"product_name": newProduct.Name,
		})
	}

	response := mapper.ToProductResponse(newProduct)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	var req models.ProductRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	existingProduct, err := c.repo.GetProduct(productID)
	if err != nil {
		return logger.Error(ctx, "Product not found", err, logrus.Fields{
			"product_id": productID,
		})
	}

	updatedProduct := mapper.ToUpdateProduct(&req, &existingProduct)
	if err := c.validator.ValidateProduct(updatedProduct); err != nil {
		return err
	}

	if err := c.repo.UpdateProduct(updatedProduct); err != nil {
		return logger.Error(ctx, "Failed to update product", err, logrus.Fields{
			"product_id": productID,
		})
	}

	response := mapper.ToProductResponse(updatedProduct)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	if err := c.repo.DeleteProduct(productID); err != nil {
		return logger.Error(ctx, "Failed to delete product", err, logrus.Fields{
			"product_id": productID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}

// //////
func (c *Controller) ListProductCategories(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	categories, err := c.repo.ListProductCategories(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch categories", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := make([]*models.ProductCategoryResponse, len(categories))
	for i, category := range categories {
		response[i] = mapper.ToProductCategoryResponse(&category)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) UploadProductImage(ctx echo.Context) error {
	productId, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	// Check if product exists
	_, err = c.repo.GetProduct(productId)
	if err != nil {
		return logger.Error(ctx, "Product not found", err, logrus.Fields{
			"product_id": productId,
		})
	}

	// Get file from form
	file, err := ctx.FormFile("file")
	if err != nil {
		return errors.ValidationError("No file provided")
	}

	// Validate file
	if !cloudflare.IsValidImageFile(file.Filename) {
		return errors.ValidationError("Invalid image file type")
	}

	if !cloudflare.IsValidFileSize(file.Size, 10) { // 10MB limit
		return errors.ValidationError("File size too large (max 10MB)")
	}

	// Upload to R2
	uploadResult, err := c.bucket.UploadFile(file)
	if err != nil {
		return logger.Error(ctx, "Failed to upload image to R2", err, logrus.Fields{
			"product_id": productId,
			"filename":   file.Filename,
		})
	}

	// Check if this should be the primary image
	existingImages, _ := c.repo.GetProductImages(productId)
	isPrimary := len(existingImages) == 0

	// Create image record
	image := &models.ProductImage{
		ID:        uuid.New(),
		URL:       uploadResult.URL,
		Name:      uploadResult.Name,
		FileKey:   uploadResult.FileKey,
		IsPrimary: isPrimary,
		ProductID: productId,
		CreatedAt: time.Now(),
	}

	if err := c.repo.CreateProductImage(image); err != nil {
		// If database fails, clean up R2 storage
		c.bucket.DeleteFile(uploadResult.FileKey)
		return logger.Error(ctx, "Failed to save image record", err, logrus.Fields{
			"product_id": productId,
			"file_key":   uploadResult.FileKey,
		})
	}

	response := models.ProductImageResponse{
		ID:        image.ID,
		URL:       image.URL,
		Name:      image.Name,
		FileKey:   image.FileKey,
		IsPrimary: image.IsPrimary,
		CreatedAt: image.CreatedAt,
	}

	return ctx.JSON(http.StatusCreated, response)
}
