package models

import (
	"time"

	"github.com/google/uuid"
)

type Customer struct {
	ID           uuid.UUID `db:"id" json:"id"`
	Name         string    `db:"name" json:"name"`
	Email        *string   `db:"email" json:"email"`
	Phone        *string   `db:"phone" json:"phone"`
	Address      *string   `db:"address" json:"address"`
	CustomerType string    `db:"customer_type" json:"customerType"`
	InventoryID  uuid.UUID `db:"inventory_id" json:"inventoryId"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type CustomerRequest struct {
	Name         string  `json:"name" validate:"required,min=1,max=100"`
	Email        *string `json:"email" validate:"omitempty,email,max=100"`
	Phone        *string `json:"phone" validate:"omitempty,max=20"`
	Address      *string `json:"address"`
	CustomerType string  `json:"customerType" validate:"required,oneof=individual business"`
}

type CustomerResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        *string   `json:"email"`
	Phone        *string   `json:"phone"`
	Address      *string   `json:"address"`
	CustomerType string    `json:"customerType"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
