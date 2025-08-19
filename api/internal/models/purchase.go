package models

import (
	"time"

	"github.com/google/uuid"
)

type Purchase struct {
	ID              uuid.UUID      `db:"id" json:"id"`
	PurchaseNumber  string         `db:"purchase_number" json:"purchaseNumber"`
	VendorID        *uuid.UUID     `db:"vendor_id" json:"vendorId"`
	VendorName      string         `db:"vendor_name" json:"vendorName"`
	PurchaseDate    time.Time      `db:"purchase_date" json:"purchaseDate"`
	Eta             *time.Time     `db:"eta" json:"eta"`
	DeliveryDate    *time.Time     `db:"delivery_date" json:"deliveryDate"`
	ShippingCost    int            `db:"shipping_cost" json:"shippingCost"`
	TotalAmount     int            `db:"total_amount" json:"totalAmount"`
	PaymentStatus   string         `db:"payment_status" json:"paymentStatus"`
	PurchaseStatus  string         `db:"purchase_status" json:"purchaseStatus"`
	DiscountAmount  int            `db:"discount_amount" json:"discountAmount"`
	DiscountPercent int            `db:"discount_percent" json:"discountPercent"`
	InventoryID     uuid.UUID      `db:"inventory_id" json:"inventoryId"`
	CreatedAt       time.Time      `db:"created_at" json:"createdAt"`
	UpdatedAt       time.Time      `db:"updated_at" json:"updatedAt"`
	Items           []PurchaseItem `json:"items,omitempty"`
}

type PurchaseItem struct {
	ID         uuid.UUID `db:"id" json:"id"`
	PurchaseID uuid.UUID `db:"purchase_id" json:"purchaseId"`
	ProductID  uuid.UUID `db:"product_id" json:"productId"`
	Quantity   int       `db:"quantity" json:"quantity"`
	UnitPrice  int       `db:"unit_price" json:"unitPrice"`
	Subtotal   int       `db:"subtotal" json:"subtotal"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
	Product    *Product  `json:"product,omitempty"`
}

// DTOs
type PurchaseRequest struct {
	VendorID        *string               `json:"vendorId"`
	VendorName      *string               `json:"vendorName" validate:"min=1,max=100"`
	PurchaseDate    *time.Time            `json:"purchaseDate"`
	Eta             *time.Time            `json:"eta"`
	ShippingCost    int                   `json:"shippingCost" validate:"min=0"`
	TotalAmount     int                   `json:"totalAmount" validate:"required,min=0"`
	PaymentStatus   string                `json:"paymentStatus" validate:"omitempty,oneof=pending partial paid overdue cancelled"`
	PurchaseStatus  string                `json:"purchaseStatus" validate:"omitempty,oneof=draft ordered received partial cancelled"`
	DiscountAmount  int                   `json:"discountAmount" validate:"min=0"`
	DiscountPercent int                   `json:"discountPercent" validate:"min=0,max=100"`
	Items           []PurchaseItemRequest `json:"items" validate:"required,min=1,dive"`
}

type PurchaseItemRequest struct {
	ProductID string `json:"productId" validate:"required,uuid"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
	UnitPrice int    `json:"unitPrice" validate:"required,min=0"`
	Subtotal  int    `json:"subtotal" validate:"required,min=0"`
}

type PurchaseResponse struct {
	ID              uuid.UUID              `json:"id"`
	PurchaseNumber  string                 `json:"purchaseNumber"`
	VendorID        *uuid.UUID             `json:"vendorId"`
	VendorName      string                 `json:"vendorName"`
	PurchaseDate    time.Time              `json:"purchaseDate"`
	Eta             *time.Time             `json:"eta"`
	DeliveryDate    *time.Time             `json:"deliveryDate"`
	ShippingCost    int                    `json:"shippingCost"`
	TotalAmount     int                    `json:"totalAmount"`
	PaymentStatus   string                 `json:"paymentStatus"`
	PurchaseStatus  string                 `json:"purchaseStatus"`
	DiscountAmount  int                    `json:"discountAmount"`
	DiscountPercent int                    `json:"discountPercent"`
	CreatedAt       time.Time              `json:"createdAt"`
	UpdatedAt       time.Time              `json:"updatedAt"`
	Items           []PurchaseItemResponse `json:"items,omitempty"`
}

type PurchaseItemResponse struct {
	ID        uuid.UUID        `json:"id"`
	ProductID uuid.UUID        `json:"productId"`
	Quantity  int              `json:"quantity"`
	UnitPrice int              `json:"unitPrice"`
	Subtotal  int              `json:"subtotal"`
	CreatedAt time.Time        `json:"createdAt"`
	Product   *ProductResponse `json:"product,omitempty"`
}
