package models

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	ID              uuid.UUID  `db:"id" json:"id"`
	SaleNumber      string     `db:"sale_number" json:"saleNumber"`
	CustomerID      *uuid.UUID `db:"customer_id" json:"customerId"`
	CustomerName    string     `db:"customer_name" json:"customerName"`
	SaleDate        time.Time  `db:"sale_date" json:"saleDate"`
	TotalAmount     int        `db:"total_amount" json:"totalAmount"`
	Balance         int        `db:"balance" json:"balance"`
	PaymentStatus   string     `db:"payment_status" json:"paymentStatus"`
	DiscountAmount  int        `db:"discount_amount" json:"discountAmount"`
	DiscountPercent int        `db:"discount_percent" json:"discountPercent"`
	InventoryID     uuid.UUID  `db:"inventory_id" json:"inventoryId"`
	CreatedAt       time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updatedAt"`
	Items           []SaleItem `json:"items,omitempty"`
}

type SaleItem struct {
	ID              uuid.UUID `db:"id" json:"id"`
	SaleID          uuid.UUID `db:"sale_id" json:"saleId"`
	ProductID       uuid.UUID `db:"product_id" json:"productId"`
	Quantity        int       `db:"quantity" json:"quantity"`
	UnitPrice       int       `db:"unit_price" json:"unitPrice"`
	Subtotal        int       `db:"subtotal" json:"subtotal"`
	DiscountAmount  int       `db:"discount_amount" json:"discountAmount"`
	DiscountPercent int       `db:"discount_percent" json:"discountPercent"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt"`
	Product         *Product  `json:"product,omitempty"`
}

// DTOs
type SaleRequest struct {
	CustomerID      *string           `json:"customerId"`
	CustomerName    string            `json:"customerName" validate:"required,min=1,max=100"`
	SaleDate        *time.Time        `json:"saleDate"`
	DiscountAmount  int               `json:"discountAmount" validate:"min=0"`
	DiscountPercent int               `json:"discountPercent" validate:"min=0,max=100"`
	TotalAmount     int               `json:"totalAmount" validate:"required,min=0"`
	Balance         int               `json:"balance" validate:"min=0"`
	PaymentStatus   string            `json:"paymentStatus" validate:"omitempty,oneof=pending partial paid overdue cancelled"`
	Items           []SaleItemRequest `json:"items" validate:"required,min=1,dive"`
}

type SaleItemRequest struct {
	ProductID       string `json:"productId" validate:"required,uuid"`
	Quantity        int    `json:"quantity" validate:"required,min=1"`
	UnitPrice       int    `json:"unitPrice" validate:"required,min=0"`
	DiscountAmount  int    `json:"discountAmount" validate:"min=0"`
	DiscountPercent int    `json:"discountPercent" validate:"min=0,max=100"`
	Subtotal        int    `json:"subtotal" validate:"required,min=0"`
}

type SaleResponse struct {
	ID              uuid.UUID          `json:"id"`
	SaleNumber      string             `json:"saleNumber"`
	CustomerID      *uuid.UUID         `json:"customerId"`
	CustomerName    string             `json:"customerName"`
	SaleDate        time.Time          `json:"saleDate"`
	TotalAmount     int                `json:"totalAmount"`
	Balance         int                `json:"balance"`
	PaymentStatus   string             `json:"paymentStatus"`
	DiscountAmount  int                `json:"discountAmount"`
	DiscountPercent int                `json:"discountPercent"`
	InventoryID     uuid.UUID          `json:"inventoryId"`
	CreatedAt       time.Time          `json:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt"`
	Items           []SaleItemResponse `json:"items,omitempty"`
}

type SaleItemResponse struct {
	ID              uuid.UUID        `json:"id"`
	ProductID       uuid.UUID        `json:"productId"`
	Quantity        int              `json:"quantity"`
	UnitPrice       int              `json:"unitPrice"`
	DiscountAmount  int              `json:"discountAmount"`
	DiscountPercent int              `json:"discountPercent"`
	Subtotal        int              `json:"subtotal"`
	CreatedAt       time.Time        `json:"createdAt"`
	Product         *ProductResponse `json:"product,omitempty"`
}

// type AddItemToSaleRequest struct {
// 	ProductID       string `json:"productId" validate:"required,uuid"`
// 	Quantity        int    `json:"quantity" validate:"required,min=1"`
// 	UnitPrice       int    `json:"unitPrice" validate:"required,min=0"`
// 	DiscountAmount  int    `json:"discountAmount" validate:"min=0"`
// 	DiscountPercent int    `json:"discountPercent" validate:"min=0,max=100"`
// }

// type UpdateSaleStatusRequest struct {
// 	PaymentStatus string `json:"paymentStatus" validate:"required,oneof=pending partial paid overdue cancelled"`
// }
