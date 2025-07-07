package models

import (
	"time"

	"github.com/google/uuid"
)

type Inventory struct {
	ID        uuid.UUID `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Currency  string    `db:"currency" json:"currency"`
	UserID    uuid.UUID `db:"user_id" json:"userId"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

type InventoryRequest struct {
	Name     string `json:"name" validate:"required,min=1,max=100"`
	Currency string `json:"currency" validate:"required,min=1,max=20"`
}

type InventoryResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Currency  string    `son:"currency"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
