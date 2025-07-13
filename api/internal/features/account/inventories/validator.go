package inventories

import (
	"database/sql"
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type InventoryValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *InventoryValidator {
	return &InventoryValidator{db: db}
}

func (v *InventoryValidator) ValidateInventory(inventory *models.Inventory) error {
	var errorMessages []string

	// Name uniqueness check for the same user
	exists, err := v.inventoryExists(inventory.Name, inventory.UserID, inventory.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error validating inventory")
	}

	if exists {
		errorMessages = append(errorMessages, "Name already exists.")
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *InventoryValidator) inventoryExists(name string, userId uuid.UUID, inventoryId uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS(
			SELECT 1 FROM inventories 
			WHERE name = $1 AND user_id = $2 AND id != $3
		)`

	var exists bool
	err := v.db.Get(&exists, query, name, userId, inventoryId)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
