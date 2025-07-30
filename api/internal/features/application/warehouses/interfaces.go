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
	DeleteWarehouse(warehouseID uuid.UUID) error

	AddProductsToWarehouse(warehouseID, inventoryID uuid.UUID, items []models.StockItemRequest) error
	RemoveProductsFromWarehouse(warehouseID uuid.UUID, productIDs []uuid.UUID) error
	UpdateStockQuantity(warehouseID, productID uuid.UUID, quantity int) error
	TransferProducts(fromWarehouseID, toWarehouseID uuid.UUID, transferItems []models.StockItemRequest) error
}

type WarehouseController interface {
	ListWarehouses(ctx echo.Context) error
	GetWarehouse(ctx echo.Context) error
	CreateWarehouse(ctx echo.Context) error
	UpdateWarehouse(ctx echo.Context) error
	DeleteWarehouse(ctx echo.Context) error

	AddProductsToWarehouse(ctx echo.Context) error
	RemoveProductsFromWarehouse(ctx echo.Context) error
	UpdateStockQuantity(ctx echo.Context) error
	TransferProducts(ctx echo.Context) error
}
