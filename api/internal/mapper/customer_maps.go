package mapper

import (
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

// Customer Mappers

func ToCreateCustomer(req *models.CustomerRequest, inventoryID uuid.UUID) *models.Customer {
	var email, phone, address *string

	if req.Email != nil {
		trimmed := trim(*req.Email)
		email = &trimmed
	}
	if req.Phone != nil {
		trimmed := trim(*req.Phone)
		phone = &trimmed
	}
	if req.Address != nil {
		trimmed := trim(*req.Address)
		address = &trimmed
	}

	return &models.Customer{
		ID:           uuid.New(),
		Name:         trim(req.Name),
		Email:        email,
		Phone:        phone,
		Address:      address,
		CustomerType: req.CustomerType,
		InventoryID:  inventoryID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

func ToUpdateCustomer(req *models.CustomerRequest, existing *models.Customer) *models.Customer {
	var email, phone, address *string

	if req.Email != nil {
		trimmed := trim(*req.Email)
		email = &trimmed
	}
	if req.Phone != nil {
		trimmed := trim(*req.Phone)
		phone = &trimmed
	}
	if req.Address != nil {
		trimmed := trim(*req.Address)
		address = &trimmed
	}

	return &models.Customer{
		ID:           existing.ID,
		Name:         trim(req.Name),
		Email:        email,
		Phone:        phone,
		Address:      address,
		CustomerType: req.CustomerType,
		InventoryID:  existing.InventoryID,
		CreatedAt:    existing.CreatedAt,
		UpdatedAt:    time.Now(),
	}
}

func ToCustomerResponse(customer *models.Customer) *models.CustomerResponse {
	return &models.CustomerResponse{
		ID:           customer.ID,
		Name:         customer.Name,
		Email:        customer.Email,
		Phone:        customer.Phone,
		Address:      customer.Address,
		CustomerType: customer.CustomerType,
		CreatedAt:    customer.CreatedAt,
		UpdatedAt:    customer.UpdatedAt,
	}
}
