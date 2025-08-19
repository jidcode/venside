package sales

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type SaleRepository interface {
	ListSales(inventoryID uuid.UUID) ([]models.Sale, error)
	GetSale(saleID uuid.UUID) (models.Sale, error)
	CreateSale(sale *models.Sale) error
	DeleteSale(saleID, inventoryID uuid.UUID) error
}

type SaleController interface {
	ListSales(ctx echo.Context) error
	GetSale(ctx echo.Context) error
	CreateSale(ctx echo.Context) error
	DeleteSale(ctx echo.Context) error
}
