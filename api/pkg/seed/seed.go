package seed

import (
	"encoding/json"
	"time"

	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ProductSeedData struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Code          string    `json:"code"`
	SKU           string    `json:"sku"`
	Brand         string    `json:"brand"`
	Model         string    `json:"model"`
	Description   string    `json:"description"`
	TotalQuantity int       `json:"totalQuantity"`
	RestockLevel  int       `json:"restockLevel"`
	OptimalLevel  int       `json:"optimalLevel"`
	CostPrice     int       `json:"costPrice"`
	SellingPrice  int       `json:"sellingPrice"`
	InventoryID   string    `json:"inventoryId"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

func SeedProducts(db *sqlx.DB) error {
	// Parse JSON data
	var seedData []ProductSeedData
	if err := json.Unmarshal([]byte(ProductDataJSON), &seedData); err != nil {
		return errors.DatabaseError(err, "Parse seed data")
	}

	// Begin transaction
	tx, err := db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Begin transaction")
	}
	defer tx.Rollback()

	// Ensure inventory exists
	inventoryID := uuid.MustParse(seedData[0].InventoryID)
	if err := ensureInventoryExists(tx, inventoryID); err != nil {
		return err
	}

	// Insert products with UPSERT functionality
	query := `
		INSERT INTO products (
			id, name, code, sku, brand, model, description,
			total_quantity, restock_level, optimal_level,
			cost_price, selling_price, inventory_id,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8, $9, $10,
			$11, $12, $13,
			$14, $15
		) ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			code = EXCLUDED.code,
			sku = EXCLUDED.sku,
			brand = EXCLUDED.brand,
			model = EXCLUDED.model,
			description = EXCLUDED.description,
			total_quantity = EXCLUDED.total_quantity,
			restock_level = EXCLUDED.restock_level,
			optimal_level = EXCLUDED.optimal_level,
			cost_price = EXCLUDED.cost_price,
			selling_price = EXCLUDED.selling_price,
			updated_at = EXCLUDED.updated_at
	`

	for _, product := range seedData {
		productID := uuid.MustParse(product.ID)
		inventoryID := uuid.MustParse(product.InventoryID)

		_, err := tx.Exec(query,
			productID,
			product.Name,
			product.Code,
			product.SKU,
			product.Brand,
			product.Model,
			product.Description,
			product.TotalQuantity,
			product.RestockLevel,
			product.OptimalLevel,
			product.CostPrice,
			product.SellingPrice,
			inventoryID,
			product.CreatedAt,
			product.UpdatedAt,
		)
		if err != nil {
			return errors.DatabaseError(err, "Insert product "+product.Name)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Commit transaction")
	}

	return nil
}

func ensureInventoryExists(tx *sqlx.Tx, inventoryID uuid.UUID) error {
	var exists bool
	err := tx.Get(&exists, "SELECT EXISTS(SELECT 1 FROM inventories WHERE id = $1)", inventoryID)
	if err != nil {
		return errors.DatabaseError(err, "Check inventory existence")
	}

	if !exists {
		_, err := tx.Exec(`
			INSERT INTO inventories (id, name, userId, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
		`, inventoryID, "Seed Inventory", "0c412864-f896-4b60-b855-8f8bf41a0a07", time.Now(), time.Now())
		if err != nil {
			return errors.DatabaseError(err, "Create seed inventory")
		}
	}
	return nil
}
