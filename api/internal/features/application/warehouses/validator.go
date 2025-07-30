package warehouses

import (
	"database/sql"
	"fmt"
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

func (v *WarehouseValidator) ValidateStockItems(items []models.StockItemRequest) error {
	var errorMessages []string

	for _, item := range items {
		// Check product exists and get details
		var product struct {
			Name          string `db:"name"`
			TotalQuantity int    `db:"total_quantity"`
		}

		err := v.db.Get(&product,
			"SELECT name, total_quantity FROM products WHERE id = $1", item.ProductID)
		if err != nil {
			if err == sql.ErrNoRows {
				errorMessages = append(errorMessages,
					fmt.Sprintf("Product with ID %s not found", item.ProductID))
			} else {
				return errors.DatabaseError(err, "Error validating product")
			}
			continue
		}

		// Check if requested quantity exceeds total product quantity
		if item.StockQuantity > product.TotalQuantity {
			errorMessages = append(errorMessages,
				fmt.Sprintf("Warehouse stock quantity for product \"%s\" cannot exceed its total available quantity",
					product.Name))
		}

		// Check for negative quantities
		if item.StockQuantity < 0 {
			errorMessages = append(errorMessages,
				fmt.Sprintf("Stock quantity cannot be negative for product \"%s\"", product.Name))
		}
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}
