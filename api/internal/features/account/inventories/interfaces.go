package inventories

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type IInventoryRepository interface {
	ListInventories(userId uuid.UUID) ([]models.Inventory, error)
	GetInventory(inventoryId uuid.UUID) (models.Inventory, error)
	CreateInventory(newInventory *models.Inventory) error
	UpdateInventory(updatedInventory *models.Inventory) error
	DeleteInventory(inventoryId uuid.UUID) error
}

type IInventoriesController interface {
	ListInventories(ctx echo.Context) error
	GetInventory(ctx echo.Context) error
	CreateInventory(ctx echo.Context) error
	UpdateInventory(ctx echo.Context) error
	DeleteInventory(ctx echo.Context) error
}
