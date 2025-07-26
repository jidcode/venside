package products

import (
	"database/sql"
	"fmt"
	"math/rand"
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

	//  Default product code generation
	if product.Code == "" {
		generatedCode, err := v.generateProductCode(product.Name, product.Brand, product.Model)
		if err != nil {
			return errors.DatabaseError(err, "Error generating product code")
		}
		product.Code = generatedCode
	}

	// Default restock and optimal levels
	if product.RestockLevel == 0 {
		product.RestockLevel = 10
	}
	if product.OptimalLevel == 0 {
		product.OptimalLevel = 100
	}

	if (product.OptimalLevel == 0 || product.OptimalLevel < product.TotalQuantity) && product.TotalQuantity > 100 {
		product.OptimalLevel = product.TotalQuantity
	}

	// Validate unique fields
	nameExists, err := v.fieldExists("name", product.Name, product.InventoryID, product.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error validating product name")
	}
	if nameExists {
		errorMessages = append(errorMessages, "Product name already exists")
	}

	if product.SKU != "" {
		skuExists, err := v.fieldExists("sku", product.SKU, product.InventoryID, product.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating product SKU")
		}
		if skuExists {
			errorMessages = append(errorMessages, "SKU already exists")
		}
	}

	if product.Code != "" {
		codeExists, err := v.fieldExists("code", product.Code, product.InventoryID, product.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating product code")
		}
		if codeExists {
			errorMessages = append(errorMessages, "Product code already exists")
		}
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

// Helper methods
func (v *ProductValidator) fieldExists(fieldName, fieldValue string, inventoryID, productID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM products 
			WHERE ` + fieldName + ` = $1 
			AND inventory_id = $2 
			AND id != $3
		)`

	var exists bool
	err := v.db.Get(&exists, query, fieldValue, inventoryID, productID)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}

func (v *ProductValidator) generateProductCode(productName, productBrand, productModel string) (string, error) {
	// PN - Product Name Prefix
	nameWords := strings.Fields(strings.ToUpper(productName))
	var pn string
	if len(nameWords) >= 2 {
		pn = string(nameWords[0][0]) + string(nameWords[1][0])
	} else if len(nameWords) == 1 {
		word := nameWords[0]
		if len(word) >= 2 {
			pn = word[:2]
		} else {
			pn = word + "X"
		}
	} else {
		pn = "XX"
	}

	// BM - Brand or Model Prefix
	var bm string
	if productBrand != "" {
		brand := strings.ToUpper(productBrand)
		if len(brand) >= 2 {
			bm = brand[:2]
		} else {
			bm = brand + "X"
		}
	} else if productModel != "" {
		model := strings.ToUpper(productModel)
		if len(model) >= 2 {
			bm = model[:2]
		} else {
			bm = model + "X"
		}
	} else {
		bm = "00"
	}

	// 0000 - Random 4-digit number
	randomNumber := fmt.Sprintf("%04d", rand.Intn(10000))

	// Combine all parts
	return fmt.Sprintf("%s-%s-%s", pn, bm, randomNumber), nil
}
