package vendors

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type VendorRepository interface {
	ListVendors(inventoryID uuid.UUID) ([]models.Vendor, error)
	GetVendor(vendorID uuid.UUID) (models.Vendor, error)
	CreateVendor(vendor *models.Vendor) error
	UpdateVendor(vendor *models.Vendor) error
	DeleteVendor(vendorID, inventoryID uuid.UUID) error
}

type VendorController interface {
	ListVendors(ctx echo.Context) error
	GetVendor(ctx echo.Context) error
	CreateVendor(ctx echo.Context) error
	UpdateVendor(ctx echo.Context) error
	DeleteVendor(ctx echo.Context) error
}
