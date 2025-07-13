package inventories

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type InventoryRepository interface {
	ListInventories(userId uuid.UUID) ([]models.Inventory, error)
	GetInventory(inventoryId uuid.UUID) (*models.Inventory, error)
	CreateInventory(inventory *models.Inventory, currency *models.Currency) error
	UpdateInventory(inventory *models.Inventory, currency *models.Currency) error
	DeleteInventory(inventoryId uuid.UUID) error
}

type InventoryController interface {
	ListInventories(ctx echo.Context) error
	GetInventory(ctx echo.Context) error
	CreateInventory(ctx echo.Context) error
	UpdateInventory(ctx echo.Context) error
	DeleteInventory(ctx echo.Context) error
}
