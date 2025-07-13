package mapper

import (
	"strings"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

var trim = strings.TrimSpace

func ToCreateInventory(req *models.InventoryRequest, userID uuid.UUID) (*models.Inventory, *models.Currency) {
	inventory := &models.Inventory{
		ID:        uuid.New(),
		Name:      trim(req.Name),
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	currency := &models.Currency{
		ID:          uuid.New(),
		Name:        trim(req.Currency.Name),
		Code:        trim(req.Currency.Code),
		Locale:      trim(req.Currency.Locale),
		InventoryID: inventory.ID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	return inventory, currency
}

func ToEditInventory(req *models.InventoryRequest, existingInventory *models.Inventory, existingCurrency *models.Currency) (*models.Inventory, *models.Currency) {
	// Update inventory fields
	existingInventory.Name = req.Name
	existingInventory.UpdatedAt = time.Now()

	// Update currency fields
	existingCurrency.Name = trim(req.Currency.Name)
	existingCurrency.Code = trim(req.Currency.Code)
	existingCurrency.Locale = trim(req.Currency.Locale)
	existingCurrency.UpdatedAt = time.Now()

	return existingInventory, existingCurrency
}

func ToInventoryResponse(inventory *models.Inventory, currency *models.Currency) *models.InventoryResponse {
	return &models.InventoryResponse{
		ID:     inventory.ID,
		Name:   inventory.Name,
		UserID: inventory.UserID,
		Currency: models.CurrencyResponse{
			ID:     currency.ID,
			Name:   currency.Name,
			Code:   currency.Code,
			Locale: currency.Locale,
		},
		CreatedAt: inventory.CreatedAt,
		UpdatedAt: inventory.UpdatedAt,
	}
}
