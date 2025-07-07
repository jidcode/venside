package inventories

import (
	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(data *sqlx.DB) IInventoryRepository {
	return &Repository{db: data}
}

func (repo *Repository) ListInventories(userId uuid.UUID) ([]models.Inventory, error) {
	inventories := []models.Inventory{}
	query := `SELECT * FROM inventories WHERE user_id = $1`

	err := repo.db.Select(&inventories, query, userId)
	if err != nil {
		return nil, errors.DatabaseError(err, "List Inventories")
	}

	return inventories, nil
}

func (repo *Repository) GetInventory(inventoryId uuid.UUID) (models.Inventory, error) {
	var inventory models.Inventory
	query := `SELECT * FROM inventories WHERE id = $1`

	err := repo.db.Get(&inventory, query, inventoryId)
	if err != nil {
		return inventory, errors.DatabaseError(err, "Get Inventory")
	}

	return inventory, nil
}

func (repo *Repository) CreateInventory(newInventory *models.Inventory) error {
	query := `INSERT INTO inventories (
				id, name, currency, user_id, created_at, updated_at
			) VALUES (
				:id, :name, :currency, :user_id, :created_at, :updated_at)`

	_, err := repo.db.NamedExec(query, newInventory)
	if err != nil {
		return errors.DatabaseError(err, "Create Inventory")
	}

	return nil
}

func (repo *Repository) UpdateInventory(updatedInventory *models.Inventory) error {
	query := `UPDATE inventories
				SET name = :name,
					currency = :currency,
					updated_at = :updated_at
				WHERE id = :id`

	_, err := repo.db.NamedExec(query, updatedInventory)
	if err != nil {
		return errors.DatabaseError(err, "Edit Inventory")
	}

	return nil
}

func (repo *Repository) DeleteInventory(inventoryId uuid.UUID) error {
	query := `DELETE FROM inventories WHERE id = $1`

	_, err := repo.db.Exec(query, inventoryId)
	if err != nil {
		return errors.DatabaseError(err, "Delete Inventory")
	}

	return nil
}
