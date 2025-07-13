package models

import (
	"time"

	"github.com/google/uuid"
)

// Warehouse models
type Warehouse struct {
	ID          uuid.UUID   `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Location    string      `db:"location" json:"location"`
	Capacity    int         `db:"capacity" json:"capacity"`
	StorageType string      `db:"storage_type" json:"storageType"`
	Manager     string      `db:"manager" json:"manager"`
	Contact     string      `db:"contact" json:"contact"`
	InventoryID uuid.UUID   `db:"inventory_id" json:"inventoryId"`
	CreatedAt   time.Time   `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updatedAt"`
	StockItems  []StockItem `json:"stockItems"`
}

type WarehouseRequest struct {
	Name        string `json:"name" validate:"required,max=255"`
	Location    string `json:"location" validate:"max=255"`
	Capacity    int    `json:"capacity" validate:"gte=0"`
	StorageType string `json:"storageType" validate:"required,max=100"`
	Manager     string `json:"manager" validate:"max=255"`
	Contact     string `json:"contact" validate:"max=100"`
}

type WarehouseResponse struct {
	ID          uuid.UUID           `json:"id"`
	Name        string              `json:"name"`
	Location    string              `json:"location"`
	Capacity    int                 `json:"capacity"`
	StorageType string              `json:"storageType"`
	Manager     string              `json:"manager"`
	Contact     string              `json:"contact"`
	CreatedAt   time.Time           `json:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt"`
	StockItems  []StockItemResponse `json:"stockItems"`
}

// Warehouse stock item models
type StockItem struct {
	ProductID     uuid.UUID `db:"product_id" json:"productId"`
	WarehouseID   uuid.UUID `db:"warehouse_id" json:"warehouseId"`
	StockQuantity int       `db:"stock_quantity" json:"stockQuantity"`
	Product       Product   `json:"product"`
}

type StockItemRequest struct {
	ProductID     uuid.UUID `db:"product_id" json:"productId"`
	StockQuantity int       `db:"stock_quantity" json:"stockQuantity"`
}

type StockItemResponse struct {
	Product       ProductResponse `json:"product"`
	StockQuantity int             `json:"stockQuantity"`
}
