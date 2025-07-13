package warehouses

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
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

	exists, err := v.warehouseNameExists(warehouse.Name, warehouse.InventoryID, warehouse.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error validating warehouse")
	}

	if exists {
		errorMessages = append(errorMessages, "Warehouse name already exists")
	}

	if warehouse.Capacity < 0 {
		errorMessages = append(errorMessages, "Capacity cannot be negative")
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *WarehouseValidator) warehouseNameExists(warehouseName string, inventoryID, warehouseID uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS(
			SELECT 1 FROM warehouses 
			WHERE name = $1 AND inventory_id = $2 AND id != $3
		)`

	var exists bool
	err := v.db.Get(&exists, query, warehouseName, inventoryID, warehouseID)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
