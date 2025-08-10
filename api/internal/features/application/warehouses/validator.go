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

func (v *WarehouseValidator) ValidateStockItems(items []models.StockItemRequest, warehouseID uuid.UUID) error {
	if len(items) == 0 {
		return errors.ValidationError("At least one stock item is required")
	}

	var errorMessages []string

	for _, item := range items {
		if item.QuantityInStock <= 0 {
			errorMessages = append(errorMessages, "Stock quantity must be greater than 0")
			continue
		}

		// Fetch product details including name in a single query
		var product struct {
			Name          string `db:"name"`
			TotalQuantity int    `db:"total_quantity"`
			TotalStock    int    `db:"total_stock"`
		}

		err := v.db.Get(&product,
			`SELECT name, total_quantity, total_stock 
			 FROM products 
			 WHERE id = $1`, item.ProductID)

		if err != nil {
			if err == sql.ErrNoRows {
				errorMessages = append(errorMessages, fmt.Sprintf("Product with ID %s not found", item.ProductID))
			} else {
				return errors.DatabaseError(err, "Error validating stock items")
			}
			continue
		}

		availableQuantity := product.TotalQuantity - product.TotalStock

		if availableQuantity <= 0 {
			errorMessages = append(errorMessages, fmt.Sprintf("Product \"%s\" has no available stock to add", product.Name))
			continue
		}

		if item.QuantityInStock > availableQuantity {
			errorMessages = append(errorMessages,
				fmt.Sprintf("Cannot add %d units of \"%s\". Only %d units available",
					item.QuantityInStock, product.Name, availableQuantity))
		}
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *WarehouseValidator) ValidateTransferItems(fromWarehouseID, toWarehouseID uuid.UUID, items []models.TransferItemRequest) error {
	if len(items) == 0 {
		return errors.ValidationError("At least one transfer item is required")
	}

	if fromWarehouseID == toWarehouseID {
		return errors.ValidationError("Source and destination warehouses cannot be the same")
	}

	var errorMessages []string

	for _, item := range items {
		if item.TransferQuantity <= 0 {
			errorMessages = append(errorMessages, "Transfer quantity must be greater than 0")
			continue
		}

		// Fetch product details with current stock and inventory validation
		var product struct {
			Name         string    `db:"name"`
			CurrentStock int       `db:"current_stock"`
			InventoryID  uuid.UUID `db:"inventory_id"`
		}

		err := v.db.Get(&product, `
			SELECT 
				p.name, 
				COALESCE(wpl.quantity_in_stock, 0) as current_stock,
				p.inventory_id
			FROM products p
			LEFT JOIN warehouse_product_link wpl ON 
				p.id = wpl.product_id AND 
				wpl.warehouse_id = $1
			WHERE p.id = $2`,
			fromWarehouseID, item.ProductID)

		if err != nil {
			if err == sql.ErrNoRows {
				errorMessages = append(errorMessages,
					fmt.Sprintf("Product with ID %s not found in source warehouse", item.ProductID))
			} else {
				return errors.DatabaseError(err, "Error validating transfer items")
			}
			continue
		}

		if product.CurrentStock < item.TransferQuantity {
			errorMessages = append(errorMessages,
				fmt.Sprintf("Cannot transfer %d units of %s - only %d available in stock",
					item.TransferQuantity, product.Name, product.CurrentStock))
		}
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}
