package models

import (
	"time"

	"github.com/google/uuid"
)

type Vendor struct {
	ID          uuid.UUID `db:"id" json:"id"`
	CompanyName string    `db:"company_name" json:"companyName"`
	ContactName *string   `db:"contact_name" json:"contactName"`
	Phone       *string   `db:"phone" json:"phone"`
	Email       *string   `db:"email" json:"email"`
	Website     *string   `db:"website" json:"website"`
	Address     *string   `db:"address" json:"address"`
	InventoryID uuid.UUID `db:"inventory_id" json:"inventoryId"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

type VendorRequest struct {
	CompanyName string  `json:"companyName" validate:"required,min=1,max=100"`
	ContactName *string `json:"contactName" validate:"max=100"`
	Phone       *string `json:"phone" validate:"max=100"`
	Email       *string `json:"email" validate:"max=100"`
	Website     *string `json:"website" validate:"max=100"`
	Address     *string `json:"address" validate:"max=200"`
}

type VendorResponse struct {
	ID          uuid.UUID `json:"id"`
	CompanyName string    `json:"companyName"`
	ContactName *string   `json:"contactName"`
	Phone       *string   `json:"phone"`
	Email       *string   `json:"email"`
	Website     *string   `json:"website"`
	Address     *string   `json:"address"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
