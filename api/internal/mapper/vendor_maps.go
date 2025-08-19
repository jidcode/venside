package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

// Vendor Mappers

func ToCreateVendor(req *models.VendorRequest, inventoryID uuid.UUID) *models.Vendor {
	var contactName, phone, email, website, address *string

	if req.ContactName != nil {
		trimmed := trim(*req.ContactName)
		contactName = &trimmed
	}
	if req.Phone != nil {
		trimmed := trim(*req.Phone)
		phone = &trimmed
	}
	if req.Email != nil {
		trimmed := trim(*req.Email)
		email = &trimmed
	}
	if req.Website != nil {
		trimmed := trim(*req.Website)
		website = &trimmed
	}
	if req.Address != nil {
		trimmed := trim(*req.Address)
		address = &trimmed
	}

	return &models.Vendor{
		ID:          uuid.New(),
		CompanyName: trim(req.CompanyName),
		ContactName: contactName,
		Phone:       phone,
		Email:       email,
		Website:     website,
		Address:     address,
		InventoryID: inventoryID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

func ToUpdateVendor(req *models.VendorRequest, existing *models.Vendor) *models.Vendor {
	var contactName, phone, email, website, address *string

	if req.ContactName != nil {
		trimmed := trim(*req.ContactName)
		contactName = &trimmed
	}
	if req.Phone != nil {
		trimmed := trim(*req.Phone)
		phone = &trimmed
	}
	if req.Email != nil {
		trimmed := trim(*req.Email)
		email = &trimmed
	}
	if req.Website != nil {
		trimmed := trim(*req.Website)
		website = &trimmed
	}
	if req.Address != nil {
		trimmed := trim(*req.Address)
		address = &trimmed
	}

	return &models.Vendor{
		ID:          existing.ID,
		CompanyName: trim(req.CompanyName),
		ContactName: contactName,
		Phone:       phone,
		Email:       email,
		Website:     website,
		Address:     address,
		InventoryID: existing.InventoryID,
		CreatedAt:   existing.CreatedAt,
		UpdatedAt:   time.Now(),
	}
}

func ToVendorResponse(vendor *models.Vendor) *models.VendorResponse {
	return &models.VendorResponse{
		ID:          vendor.ID,
		CompanyName: vendor.CompanyName,
		ContactName: vendor.ContactName,
		Phone:       vendor.Phone,
		Email:       vendor.Email,
		Website:     vendor.Website,
		Address:     vendor.Address,
		CreatedAt:   vendor.CreatedAt,
		UpdatedAt:   vendor.UpdatedAt,
	}
}
