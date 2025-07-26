package products

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type ProductRepository interface {
	ListProducts(inventoryID uuid.UUID) ([]models.Product, error)
	GetProduct(productID uuid.UUID) (models.Product, error)
	GetProductWithDetails(productID uuid.UUID) (models.Product, error)
	CreateProduct(product *models.Product, categories []string) error
	UpdateProduct(product *models.Product, categories []string) error
	DeleteProduct(productID uuid.UUID) error

	ListProductCategories(inventoryID uuid.UUID) ([]models.ProductCategory, error)
	GetProductImages(productID uuid.UUID) ([]models.ProductImage, error)
	CreateProductImage(image *models.ProductImage) error
	DeleteProductImage(imageID uuid.UUID) error
	SetPrimaryImage(imageId, inventoryID uuid.UUID) error
}

type ProductController interface {
	ListProducts(ctx echo.Context) error
	GetProduct(ctx echo.Context) error
	CreateProduct(ctx echo.Context) error
	UpdateProduct(ctx echo.Context) error
	DeleteProduct(ctx echo.Context) error

	ListProductCategories(ctx echo.Context) error
	SetPrimaryImage(ctx echo.Context) error
}
