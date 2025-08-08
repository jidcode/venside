package products

import (
	"net/http"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
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
			"details":      err.Error(),
		})
	}

	response := make([]models.ProductResponse, len(products))
	for i, product := range products {
		detailedProduct, err := c.repo.GetProductWithDetails(product.ID)
		if err != nil {
			return logger.Error(ctx, "Failed to fetch product details", err, logrus.Fields{
				"product_id": product.ID,
				"details":    err.Error(),
			})
		}
		response[i] = *mapper.ToProductResponse(&detailedProduct)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	product, err := c.repo.GetProductWithDetails(productID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve product", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
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

	if err := ctx.Request().ParseMultipartForm(32 << 20); err != nil {
		return errors.ValidationError("Failed to parse multipart form")
	}

	req, err := c.parseProductRequest(ctx)
	if err != nil {
		return err
	}

	newProduct := mapper.ToCreateProduct(&req, inventoryID)
	if err := c.validator.ValidateProduct(newProduct); err != nil {
		return err
	}

	if err := c.repo.CreateProduct(newProduct, req.Categories); err != nil {
		return logger.Error(ctx, "Failed to create product", err, logrus.Fields{
			"product_name": newProduct.Name,
			"details":      err.Error(),
		})
	}

	if err := c.uploadProductImages(ctx, newProduct.ID, req.NewImages); err != nil {
		return err
	}

	response := mapper.ToProductResponse(newProduct)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	existingProduct, err := c.repo.GetProduct(productID)
	if err != nil {
		return logger.Error(ctx, "Product not found", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
		})
	}

	if err := ctx.Request().ParseMultipartForm(32 << 20); err != nil {
		return errors.ValidationError("Failed to parse multipart form")
	}

	req, err := c.parseProductRequest(ctx)
	if err != nil {
		return err
	}

	updatedProduct := mapper.ToUpdateProduct(&req, &existingProduct)
	if err := c.validator.ValidateProduct(updatedProduct); err != nil {
		return err
	}

	if err := c.repo.UpdateProduct(updatedProduct, req.Categories); err != nil {
		return logger.Error(ctx, "Failed to update product", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
		})
	}

	if err := c.updateProductImages(ctx, productID, req.NewImages, req.ExistingImages); err != nil {
		return err
	}

	finalProduct, err := c.repo.GetProductWithDetails(productID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve updated product", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
		})
	}

	response := mapper.ToProductResponse(&finalProduct)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteProduct(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	images, err := c.repo.GetProductImages(productID)
	if err != nil {
		return logger.Error(ctx, "Failed to get product images for cleanup", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
		})
	}

	if err := c.repo.DeleteProduct(productID); err != nil {
		return logger.Error(ctx, "Failed to delete product", err, logrus.Fields{
			"product_id": productID,
			"details":    err.Error(),
		})
	}

	if len(images) > 0 {
		fileKeys := make([]string, len(images))
		for i, img := range images {
			fileKeys[i] = img.FileKey
		}

		if err := c.bucket.DeleteFiles(fileKeys); err != nil {
			logger.Error(ctx, "Failed to delete product images from R2", err, logrus.Fields{
				"product_id": productID,
				"file_keys":  fileKeys,
				"details":    err.Error(),
			})
		}
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) DeleteMultipleProducts(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	type DeleteProductsRequest struct {
		ProductIDs []string `json:"productIds" validate:"required,min=1,dive"`
	}

	var req DeleteProductsRequest

	if err := ctx.Bind(&req); err != nil {
		return errors.ValidationError("Invalid request body")
	}

	if err := ctx.Validate(&req); err != nil {
		return errors.ValidationError(err.Error())
	}

	productIDs := make([]uuid.UUID, len(req.ProductIDs))
	for i, id := range req.ProductIDs {
		pid, err := uuid.Parse(id)
		if err != nil {
			return errors.ValidationError("Invalid product ID")
		}
		productIDs[i] = pid
	}

	images, err := c.repo.GetImagesOfMultipleProducts(productIDs)
	if err != nil {
		return logger.Error(ctx, "Failed to get product images for cleanup", err, logrus.Fields{
			"product_ids": productIDs,
			"details":     err.Error(),
		})
	}

	if err := c.repo.DeleteMultipleProducts(productIDs, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete products", err, logrus.Fields{
			"product_ids": productIDs,
			"details":     err.Error(),
		})
	}

	if len(images) > 0 {
		fileKeys := make([]string, len(images))
		for i, img := range images {
			fileKeys[i] = img.FileKey
		}

		if err := c.bucket.DeleteFiles(fileKeys); err != nil {
			logger.Error(ctx, "Failed to delete product images from R2", err, logrus.Fields{
				"product_ids": productIDs,
				"file_keys":   fileKeys,
				"details":     err.Error(),
			})
		}
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) ListProductCategories(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	categories, err := c.repo.ListProductCategories(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch categories", err, logrus.Fields{
			"inventory_id": inventoryID,
			"details":      err.Error(),
		})
	}

	response := make([]*models.ProductCategoryResponse, len(categories))
	for i, category := range categories {
		response[i] = mapper.ToProductCategoryResponse(&category)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) SetPrimaryImage(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	imageID, err := uuid.Parse(ctx.Param("imageId"))
	if err != nil {
		return errors.ValidationError("Invalid image ID")
	}

	if err := c.repo.SetPrimaryImage(imageID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to set primary image", err, logrus.Fields{
			"image_id": imageID,
			"details":  err.Error(),
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
