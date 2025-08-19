package vendors

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type VendorValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *VendorValidator {
	return &VendorValidator{db: db}
}

func (v *VendorValidator) ValidateVendor(vendor *models.Vendor) error {
	var errorMessages []string

	// Validate unique fields
	if vendor.Email != nil && *vendor.Email != "" {
		emailExists, err := v.fieldExists("email", *vendor.Email, vendor.InventoryID, vendor.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating vendor email")
		}
		if emailExists {
			errorMessages = append(errorMessages, "Email already exists")
		}
	}

	if vendor.Phone != nil && *vendor.Phone != "" {
		phoneExists, err := v.fieldExists("phone", *vendor.Phone, vendor.InventoryID, vendor.ID)
		if err != nil {
			return errors.DatabaseError(err, "Error validating vendor phone")
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

func (v *VendorValidator) fieldExists(fieldName, fieldValue string, inventoryID, vendorID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM vendors 
			WHERE ` + fieldName + ` = $1 
			AND inventory_id = $2 
			AND id != $3
		)`

	var exists bool
	err := v.db.Get(&exists, query, fieldValue, inventoryID, vendorID)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
