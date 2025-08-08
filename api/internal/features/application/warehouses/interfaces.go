package warehouses

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type WarehouseRepository interface {
	ListWarehouses(inventoryID uuid.UUID) ([]models.Warehouse, error)
	GetWarehouse(warehouseID uuid.UUID) (models.Warehouse, error)
	GetWarehouseWithStock(warehouseID uuid.UUID) (models.Warehouse, error)
	CreateWarehouse(warehouse *models.Warehouse) error
	UpdateWarehouse(warehouse *models.Warehouse) error
	DeleteWarehouse(warehouseID, inventoryID uuid.UUID) error

	AddProductsToWarehouse(warehouseID, inventoryID uuid.UUID, items []models.StockItemRequest) error
	RemoveProductFromWarehouse(inventoryID, warehouseID, productID uuid.UUID) error
	TransferWarehouseStock(inventoryID uuid.UUID, fromWarehouseID, toWarehouseID uuid.UUID, items []models.TransferItemRequest) error
	UpdateStockQuantity(inventoryID, warehouseID, productID uuid.UUID, newQuantity int) error
}

type WarehouseController interface {
	ListWarehouses(ctx echo.Context) error
	GetWarehouse(ctx echo.Context) error
	CreateWarehouse(ctx echo.Context) error
	UpdateWarehouse(ctx echo.Context) error
	DeleteWarehouse(ctx echo.Context) error

	AddProductsToWarehouse(ctx echo.Context) error
	RemoveProductFromWarehouse(ctx echo.Context) error
	TransferWarehouseStock(ctx echo.Context) error
	UpdateStockQuantity(ctx echo.Context) error
}
