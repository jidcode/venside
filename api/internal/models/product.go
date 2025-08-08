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
	TotalStock    int               `db:"total_stock" json:"totalStock"`
	RestockLevel  int               `db:"restock_level" json:"restockLevel"`
	OptimalLevel  int               `db:"optimal_level" json:"optimalLevel"`
	CostPrice     int               `db:"cost_price" json:"costPrice"`
	SellingPrice  int               `db:"selling_price" json:"sellingPrice"`
	InventoryID   uuid.UUID         `db:"inventory_id" json:"inventoryId"`
	CreatedAt     time.Time         `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time         `db:"updated_at" json:"updatedAt"`
	Images        []ProductImage    `json:"images"`
	Categories    []ProductCategory `json:"categories"`
	Storages      []Storage         `json:"storages"`
}

type ProductRequest struct {
	Name           string                  `json:"name" validate:"required,max=255"`
	Code           string                  `json:"code" validate:"max=100"`
	SKU            string                  `json:"sku" validate:"max=100"`
	Brand          string                  `json:"brand" validate:"max=255"`
	Model          string                  `json:"model" validate:"max=255"`
	Description    string                  `json:"description"`
	TotalQuantity  int                     `json:"totalQuantity" validate:"gte=0"`
	TotalStock     int                     `json:"totalStock" validate:"gte=0"`
	RestockLevel   int                     `json:"restockLevel" validate:"gte=0"`
	OptimalLevel   int                     `json:"optimalLevel" validate:"gte=0"`
	CostPrice      int                     `json:"costPrice" validate:"gte=0"`
	SellingPrice   int                     `json:"sellingPrice" validate:"gte=0"`
	Categories     []string                `json:"categories" validate:"dive,min=1,max=100"`
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
	TotalStock    int                       `json:"totalStock"`
	RestockLevel  int                       `json:"restockLevel"`
	OptimalLevel  int                       `json:"optimalLevel"`
	CostPrice     int                       `json:"costPrice"`
	SellingPrice  int                       `json:"sellingPrice"`
	CreatedAt     time.Time                 `json:"createdAt"`
	UpdatedAt     time.Time                 `json:"updatedAt"`
	Images        []ProductImageResponse    `json:"images"`
	Categories    []ProductCategoryResponse `json:"categories"`
	Storages      []StorageResponse         `json:"storages"`
}

type ProductWithStock struct {
	ID              uuid.UUID `db:"id"`
	Name            string    `db:"name"`
	Code            string    `db:"code"`
	SKU             string    `db:"sku"`
	Brand           string    `db:"brand"`
	Model           string    `db:"model"`
	Description     string    `db:"description"`
	TotalQuantity   int       `db:"total_quantity"`
	TotalStock      int       `db:"total_stock"`
	RestockLevel    int       `db:"restock_level"`
	OptimalLevel    int       `db:"optimal_level"`
	CostPrice       int       `db:"cost_price"`
	SellingPrice    int       `db:"selling_price"`
	InventoryID     uuid.UUID `db:"inventory_id"`
	CreatedAt       time.Time `db:"created_at"`
	UpdatedAt       time.Time `db:"updated_at"`
	QuantityInStock int       `db:"quantity_in_stock"`
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

// Storage models
type Storage struct {
	Warehouse       Warehouse `json:"warehouse"`
	QuantityInStock int       `json:"quantityInStock"`
}

type StorageRequest struct {
	WarehouseID     uuid.UUID `db:"warehouse_id" json:"warehouseId"`
	QuantityInStock int       `db:"quantity_in_stock" json:"quantityInStock"`
}

type StorageResponse struct {
	Warehouse       WarehouseResponse `json:"warehouse"`
	QuantityInStock int               `json:"quantityInStock"`
}
