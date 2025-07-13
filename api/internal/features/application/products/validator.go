package products

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ProductValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *ProductValidator {
	return &ProductValidator{db: db}
}

func (v *ProductValidator) ValidateProduct(product *models.Product) error {
	var errorMessages []string

	// Validate name uniqueness
	nameExists, err := v.productNameExists(product.Name, product.InventoryID, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error validating product name")
	}
	if nameExists {
		errorMessages = append(errorMessages, "Product name already exists in this inventory")
	}

	// Validate code uniqueness if provided
	if product.Code != "" {
		codeExists, err := v.productCodeExists(product.Code, product.InventoryID, product.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating product code")
		}
		if codeExists {
			errorMessages = append(errorMessages, "Product code already exists in this inventory")
		}
	}

	// Validate SKU uniqueness if provided
	if product.SKU != "" {
		skuExists, err := v.productSkuExists(product.SKU, product.InventoryID, product.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating product SKU")
		}
		if skuExists {
			errorMessages = append(errorMessages, "Product SKU already exists in this inventory")
		}
	}

	// Validate quantities
	if product.TotalQuantity < 0 {
		errorMessages = append(errorMessages, "Total quantity cannot be negative")
	}
	if product.RestockLevel < 0 {
		errorMessages = append(errorMessages, "Restock level cannot be negative")
	}
	if product.OptimalLevel < 0 {
		errorMessages = append(errorMessages, "Optimal level cannot be negative")
	}
	if product.CostPrice < 0 {
		errorMessages = append(errorMessages, "Cost price cannot be negative")
	}
	if product.SellingPrice < 0 {
		errorMessages = append(errorMessages, "Selling price cannot be negative")
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *ProductValidator) productNameExists(name string, inventoryID, productID uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS(
			SELECT 1 FROM products 
			WHERE name = $1 AND inventory_id = $2 AND id != $3
		)`
	return v.exists(query, name, inventoryID, productID)
}

func (v *ProductValidator) productCodeExists(code string, inventoryID, productID uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS(
			SELECT 1 FROM products 
			WHERE code = $1 AND inventory_id = $2 AND id != $3
		)`
	return v.exists(query, code, inventoryID, productID)
}

func (v *ProductValidator) productSkuExists(sku string, inventoryID, productID uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS(
			SELECT 1 FROM products 
			WHERE sku = $1 AND inventory_id = $2 AND id != $3
		)`
	return v.exists(query, sku, inventoryID, productID)
}

func (v *ProductValidator) exists(query string, value string, inventoryID, productID uuid.UUID) (bool, error) {
	var exists bool
	err := v.db.Get(&exists, query, value, inventoryID, productID)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
