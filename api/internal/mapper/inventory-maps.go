package mapper

import (
	"strings"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func ToCreateInventory(req *models.InventoryRequest, userID uuid.UUID) *models.Inventory {
	return &models.Inventory{
		ID:        uuid.New(),
		Name:      req.Name,
		Currency:  req.Currency,
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func ToEditInventory(req *models.InventoryRequest, existing *models.Inventory) *models.Inventory {
	existing.Name = req.Name
	existing.Currency = req.Currency
	existing.UpdatedAt = time.Now()

	return existing
}

func ToInventoryResponse(inventory *models.Inventory) *models.InventoryResponse {
	return &models.InventoryResponse{
		ID:        inventory.ID,
		Name:      inventory.Name,
		Currency:  inventory.Currency,
		CreatedAt: inventory.CreatedAt,
		UpdatedAt: inventory.UpdatedAt,
	}
}

func SanitizeInventoryRequest(req *models.InventoryRequest) {
	req.Name = strings.TrimSpace(req.Name)
	req.Currency = strings.TrimSpace(req.Currency)
}
