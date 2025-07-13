package models

import (
	"time"

	"github.com/google/uuid"
)

// Inventory models
type Inventory struct {
	ID        uuid.UUID `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	UserID    uuid.UUID `db:"user_id" json:"userId"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
	Currency  *Currency `json:"currency,omitempty"`
}

type InventoryRequest struct {
	Name     string          `json:"name" validate:"required,min=1,max=100"`
	Currency CurrencyRequest `json:"currency" validate:"required"`
}

type InventoryResponse struct {
	ID        uuid.UUID        `json:"id"`
	Name      string           `json:"name"`
	UserID    uuid.UUID        `json:"userId"`
	Currency  CurrencyResponse `json:"currency"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
}

// Currency models
type Currency struct {
	ID          uuid.UUID `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Code        string    `db:"code" json:"code"`
	Locale      string    `db:"locale" json:"locale"`
	InventoryID uuid.UUID `db:"inventory_id" json:"inventoryId"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

type CurrencyRequest struct {
	Name   string `json:"name" validate:"required,min=1,max=100"`
	Code   string `json:"code" validate:"required,min=1,max=10"`
	Locale string `json:"locale" validate:"required,min=1,max=10"`
}

type CurrencyResponse struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Code   string    `json:"code"`
	Locale string    `json:"locale"`
}
