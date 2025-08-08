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
	IsMain      bool        `db:"is_main" json:"isMain"`
	Manager     string      `db:"manager" json:"manager"`
	Phone       string      `db:"phone" json:"phone"`
	Email       string      `db:"email" json:"email"`
	InventoryID uuid.UUID   `db:"inventory_id" json:"inventoryId"`
	CreatedAt   time.Time   `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updatedAt"`
	StockItems  []StockItem `json:"stockItems"`
}

type WarehouseRequest struct {
	Name        string `json:"name" validate:"required,max=100"`
	Location    string `json:"location" validate:"max=200"`
	Capacity    int    `json:"capacity" validate:"gte=0"`
	StorageType string `json:"storageType" validate:"required,max=100"`
	IsMain      bool   `json:"isMain"`
	Manager     string `json:"manager" validate:"max=100"`
	Phone       string `json:"phone"`
	Email       string `json:"email" validate:"omitempty,email"`
}

type WarehouseResponse struct {
	ID          uuid.UUID           `json:"id"`
	Name        string              `json:"name"`
	Location    string              `json:"location"`
	Capacity    int                 `json:"capacity"`
	StorageType string              `json:"storageType"`
	IsMain      bool                `json:"isMain"`
	Manager     string              `json:"manager"`
	Phone       string              `json:"phone"`
	Email       string              `json:"email"`
	CreatedAt   time.Time           `json:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt"`
	StockItems  []StockItemResponse `json:"stockItems"`
}

type WarehouseWithStock struct {
	ID              uuid.UUID `db:"id"`
	Name            string    `db:"name"`
	Location        string    `db:"location"`
	Capacity        int       `db:"capacity"`
	StorageType     string    `db:"storage_type"`
	IsMain          bool      `db:"is_main"`
	Manager         string    `db:"manager"`
	Phone           string    `db:"phone"`
	Email           string    `db:"email"`
	CreatedAt       time.Time `db:"created_at"`
	UpdatedAt       time.Time `db:"updated_at"`
	QuantityInStock int       `db:"quantity_in_stock"`
}

// Warehouse stock item models
type StockItem struct {
	Product         Product `json:"product"`
	QuantityInStock int     `json:"quantityInStock"`
}

type StockItemRequest struct {
	ProductID       uuid.UUID `db:"product_id" json:"productId"`
	QuantityInStock int       `db:"quantity_in_stock" json:"quantityInStock"`
}

type StockItemResponse struct {
	Product         ProductResponse `json:"product"`
	QuantityInStock int             `json:"quantityInStock"`
}

type TransferItemRequest struct {
	ProductID        uuid.UUID `json:"productId" validate:"required"`
	TransferQuantity int       `json:"transferQuantity" validate:"required,min=1"`
}
