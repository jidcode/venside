package models

import (
	"mime/multipart"
	"time"

	"github.com/google/uuid"
)

// Product models
type Product struct {
	ID            uuid.UUID         `db:"id" json:"id"`
	Name          string            `db:"name" json:"name"`
	Code          string            `db:"code" json:"code"`
	SKU           string            `db:"sku" json:"sku"`
	Brand         string            `db:"brand" json:"brand"`
	Model         string            `db:"model" json:"model"`
	Description   string            `db:"description" json:"description"`
	TotalQuantity int               `db:"total_quantity" json:"totalQuantity"`
	RestockLevel  int               `db:"restock_level" json:"restockLevel"`
	OptimalLevel  int               `db:"optimal_level" json:"optimalLevel"`
	CostPrice     int               `db:"cost_price" json:"costPrice"`
	SellingPrice  int               `db:"selling_price" json:"sellingPrice"`
	InventoryID   uuid.UUID         `db:"inventory_id" json:"inventoryId"`
	CreatedAt     time.Time         `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time         `db:"updated_at" json:"updatedAt"`
	Categories    []ProductCategory `json:"categories"`
	Storages      []Storage         `json:"storages"`
	Images        []ProductImage    `json:"images"`
}

type ProductRequest struct {
	Name           string                  `json:"name" validate:"required,max=100"`
	Code           string                  `json:"code" validate:"max=20"`
	SKU            string                  `json:"sku" validate:"max=20"`
	Brand          string                  `json:"brand" validate:"max=50"`
	Model          string                  `json:"model" validate:"max=50"`
	Description    string                  `json:"description" validate:"max=200"`
	TotalQuantity  int                     `json:"totalQuantity" validate:"gte=0"`
	RestockLevel   int                     `json:"restockLevel" validate:"gte=0"`
	OptimalLevel   int                     `json:"optimalLevel" validate:"gte=0"`
	CostPrice      int                     `json:"costPrice" validate:"gte=0"`
	SellingPrice   int                     `json:"sellingPrice" validate:"gte=0"`
	Categories     []string                `json:"categories" validate:"dive,min=1,max=50"`
	NewImages      []*multipart.FileHeader `json:"newImages"`
	ExistingImages []ProductImageRequest   `json:"existingImages"`
}

type ProductResponse struct {
	ID            uuid.UUID                 `json:"id"`
	Name          string                    `json:"name"`
	Code          string                    `json:"code"`
	SKU           string                    `json:"sku"`
	Brand         string                    `json:"brand"`
	Model         string                    `json:"model"`
	Description   string                    `json:"description"`
	TotalQuantity int                       `json:"totalQuantity"`
	RestockLevel  int                       `json:"restockLevel"`
	OptimalLevel  int                       `json:"optimalLevel"`
	CostPrice     int                       `json:"costPrice"`
	SellingPrice  int                       `json:"sellingPrice"`
	CreatedAt     time.Time                 `json:"createdAt"`
	UpdatedAt     time.Time                 `json:"updatedAt"`
	Categories    []ProductCategoryResponse `json:"categories"`
	Storages      []StorageResponse         `json:"storages"`
	Images        []ProductImageResponse    `json:"images"`
}

type ProductWithStock struct {
	ID            uuid.UUID `db:"id"`
	Name          string    `db:"name"`
	Code          string    `db:"code"`
	SKU           string    `db:"sku"`
	Brand         string    `db:"brand"`
	Model         string    `db:"model"`
	Description   string    `db:"description"`
	TotalQuantity int       `db:"total_quantity"`
	RestockLevel  int       `db:"restock_level"`
	OptimalLevel  int       `db:"optimal_level"`
	CostPrice     int       `db:"cost_price"`
	SellingPrice  int       `db:"selling_price"`
	InventoryID   uuid.UUID `db:"inventory_id"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
	StockQuantity int       `db:"stock_quantity"`
}

// Image models
type ProductImage struct {
	ID        uuid.UUID `db:"id" json:"id"`
	URL       string    `db:"url" json:"url"`
	Name      string    `db:"name" json:"name"`
	FileKey   string    `db:"file_key" json:"fileKey"`
	IsPrimary bool      `db:"is_primary" json:"isPrimary"`
	ProductID uuid.UUID `db:"product_id" json:"productId"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

type ProductImageRequest struct {
	ID      string `json:"id"`
	URL     string `json:"url"`
	FileKey string `json:"fileKey"`
}

type ProductImageResponse struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	Name      string    `json:"name"`
	FileKey   string    `json:"fileKey"`
	IsPrimary bool      `json:"isPrimary"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Category models
type ProductCategory struct {
	ID          uuid.UUID `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	InventoryID uuid.UUID `db:"inventory_id" json:"inventoryId"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

type ProductCategoryResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ProductCategoryLink struct {
	ProductID  uuid.UUID `db:"product_id" json:"productId"`
	CategoryID uuid.UUID `db:"category_id" json:"categoryId"`
}

// Product storage models
type Storage struct {
	ProductID     uuid.UUID `db:"product_id" json:"productId"`
	WarehouseID   uuid.UUID `db:"warehouse_id" json:"warehouseId"`
	StockQuantity int       `db:"stock_quantity" json:"stockQuantity"`
	Warehouse     Warehouse `json:"warehouse"`
}

type StorageRequest struct {
	WarehouseID   uuid.UUID `db:"warehouse_id" json:"warehouseId"`
	StockQuantity int       `db:"stock_quantity" json:"stockQuantity"`
}

type StorageResponse struct {
	Warehouse     WarehouseResponse `json:"warehouse"`
	StockQuantity int               `json:"stockQuantity"`
}
