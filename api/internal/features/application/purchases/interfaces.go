package purchases

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type PurchaseRepository interface {
	ListPurchases(inventoryID uuid.UUID) ([]models.Purchase, error)
	GetPurchase(PurchaseID uuid.UUID) (models.Purchase, error)
	CreatePurchase(Purchase *models.Purchase) error
	DeletePurchase(PurchaseID, inventoryID uuid.UUID) error
}

type PurchaseController interface {
	ListPurchases(ctx echo.Context) error
	GetPurchase(ctx echo.Context) error
	CreatePurchase(ctx echo.Context) error
	DeletePurchase(ctx echo.Context) error
}
