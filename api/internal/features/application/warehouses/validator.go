package warehouses

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/jmoiron/sqlx"
)

type WarehouseValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *WarehouseValidator {
	return &WarehouseValidator{db: db}
}

func (v *WarehouseValidator) ValidateWarehouse(warehouse *models.Warehouse) error {
	var errorMessages []string

	// Validate name uniqueness
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM warehouses WHERE name = $1 AND inventory_id = $2 AND id != $3)`

	err := v.db.Get(&exists, query, warehouse.Name, warehouse.InventoryID, warehouse.ID)
	if err != nil && err != sql.ErrNoRows {
		return errors.DatabaseError(err, "Error validating warehouse name")
	}

	if exists {
		errorMessages = append(errorMessages, "Warehouse name already exists")
	}

	// Set default storage type if empty
	if strings.TrimSpace(warehouse.StorageType) == "" {
		warehouse.StorageType = "units"
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}
