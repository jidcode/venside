package inventories

import (
	"database/sql"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(data *sqlx.DB) InventoryRepository {
	return &Repository{db: data}
}

func (r *Repository) ListInventories(userId uuid.UUID) ([]models.Inventory, error) {
	inventories := []models.Inventory{}
	query := `SELECT * FROM inventories WHERE user_id = $1`

	err := r.db.Select(&inventories, query, userId)
	if err != nil {
		return nil, errors.DatabaseError(err, "List Inventories")
	}

	return inventories, nil
}

func (r *Repository) GetInventory(inventoryId uuid.UUID) (*models.Inventory, error) {
	var inventory models.Inventory
	var currency models.Currency

	tx, err := r.db.Beginx()
	if err != nil {
		return nil, errors.DatabaseError(err, "Begin transaction")
	}
	defer tx.Rollback()

	// Get inventory
	err = tx.Get(&inventory, `SELECT * FROM inventories WHERE id = $1`, inventoryId)
	if err != nil {
		if err == sql.ErrNoRows {
			return &inventory, errors.NotFoundError("Inventory not found")
		}
		return nil, errors.DatabaseError(err, "Get Inventory")
	}

	// Get currency
	err = tx.Get(&currency, `SELECT * FROM currencies WHERE inventory_id = $1`, inventoryId)
	if err != nil {
		return nil, errors.DatabaseError(err, "Get Currency")
	}

	inventory.Currency = &currency

	if err := tx.Commit(); err != nil {
		return nil, errors.DatabaseError(err, "Commit transaction")
	}

	return &inventory, nil
}

func (r *Repository) CreateInventory(inventory *models.Inventory, currency *models.Currency) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Begin transaction")
	}
	defer tx.Rollback()

	// Create inventory
	inventoryQuery := `INSERT INTO inventories (id, name, user_id, created_at, updated_at) 
					   VALUES (:id, :name, :user_id, :created_at, :updated_at)`

	_, err = tx.NamedExec(inventoryQuery, inventory)
	if err != nil {
		return errors.DatabaseError(err, "Create Inventory")
	}

	// Create currency
	currencyQuery := `INSERT INTO currencies (id, name, code, locale, inventory_id, created_at, updated_at)
					  VALUES (:id, :name, :code, :locale, :inventory_id, :created_at, :updated_at)`

	_, err = tx.NamedExec(currencyQuery, currency)
	if err != nil {
		return errors.DatabaseError(err, "Create Currency")
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Commit transaction")
	}

	return nil
}

func (r *Repository) UpdateInventory(inventory *models.Inventory, currency *models.Currency) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Begin transaction")
	}
	defer tx.Rollback()

	// Update inventory
	inventoryQuery := `UPDATE inventories SET 
						name = :name, 
						updated_at = :updated_at 
						WHERE id = :id`

	_, err = tx.NamedExec(inventoryQuery, inventory)
	if err != nil {
		return errors.DatabaseError(err, "Update Inventory")
	}

	// Update currency
	currencyQuery := `UPDATE currencies SET 
						name = :name, 
						code = :code, 
						locale = :locale, 
						updated_at = :updated_at 
						WHERE inventory_id = :inventory_id`

	_, err = tx.NamedExec(currencyQuery, currency)
	if err != nil {
		return errors.DatabaseError(err, "Update Currency")
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Commit transaction")
	}

	return nil
}

func (r *Repository) DeleteInventory(inventoryId uuid.UUID) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Begin transaction")
	}
	defer tx.Rollback()

	// Delete related currency first
	_, err = tx.Exec(`DELETE FROM currencies WHERE inventory_id = $1`, inventoryId)
	if err != nil {
		return errors.DatabaseError(err, "Delete Currency")
	}

	// Then delete inventory
	_, err = tx.Exec(`DELETE FROM inventories WHERE id = $1`, inventoryId)
	if err != nil {
		return errors.DatabaseError(err, "Delete Inventory")
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Commit transaction")
	}

	return nil
}
