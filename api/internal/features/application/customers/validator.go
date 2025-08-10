package customers

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type CustomerValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *CustomerValidator {
	return &CustomerValidator{db: db}
}

func (v *CustomerValidator) ValidateCustomer(customer *models.Customer) error {
	var errorMessages []string

	// Validate unique fields
	if customer.Email != nil && *customer.Email != "" {
		emailExists, err := v.fieldExists("email", *customer.Email, customer.InventoryID, customer.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating customer email")
		}
		if emailExists {
			errorMessages = append(errorMessages, "Email already exists")
		}
	}

	if customer.Phone != nil && *customer.Phone != "" {
		phoneExists, err := v.fieldExists("phone", *customer.Phone, customer.InventoryID, customer.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating customer phone")
		}
		if phoneExists {
			errorMessages = append(errorMessages, "Phone number already exists")
		}
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *CustomerValidator) fieldExists(fieldName, fieldValue string, inventoryID, customerID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM customers 
			WHERE ` + fieldName + ` = $1 
			AND inventory_id = $2 
			AND id != $3
		)`

	var exists bool
	err := v.db.Get(&exists, query, fieldValue, inventoryID, customerID)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
