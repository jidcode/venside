package products

import (
	"database/sql"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Helper methods
func (r *Repository) invalidateProductCaches(productID, inventoryID uuid.UUID) {
	r.cache.Delete(productCacheKey(productID))
	r.cache.Delete(productListCacheKey(inventoryID))
	r.cache.Delete(categoryListCacheKey(inventoryID))
}

func (r *Repository) handleProductCategories(
	tx *sqlx.Tx,
	productID, inventoryID uuid.UUID,
	categories []string,
) error {
	if len(categories) == 0 {
		return nil
	}

	for _, categoryName := range categories {
		//Find existing category
		var categoryID uuid.UUID
		getQuery := `SELECT id FROM product_categories WHERE name = $1 AND inventory_id = $2`

		err := tx.Get(&categoryID, getQuery, categoryName, inventoryID)
		if err == sql.ErrNoRows {
			// Create new category if it doesn't exist
			addQuery := `INSERT INTO product_categories (id, name, inventory_id, created_at, updated_at) 
						 VALUES (:id, :name, :inventory_id, :created_at, :updated_at)`

			newCategory := &models.ProductCategory{
				ID:          uuid.New(),
				Name:        categoryName,
				InventoryID: inventoryID,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			_, err = tx.NamedExec(addQuery, newCategory)
			if err != nil {
				return errors.DatabaseError(err, "Error creating category")
			}
			categoryID = newCategory.ID
		} else if err != nil {
			return errors.DatabaseError(err, "Error finding category")
		}

		// Link category to product
		mapQuery := `INSERT INTO product_category_link (product_id, category_id) 
					 VALUES (:product_id, :category_id)`

		categoryMap := &models.ProductCategoryLink{
			ProductID:  productID,
			CategoryID: categoryID,
		}

		_, err = tx.NamedExec(mapQuery, categoryMap)
		if err != nil {
			return errors.DatabaseError(err, "Error linking product to category")
		}
	}

	return nil
}

func (r *Repository) handleProductStorages(
	tx *sqlx.Tx,
	productID uuid.UUID,
	storages []models.StorageRequest,
) error {
	if len(storages) == 0 {
		return nil
	}

	query := `INSERT INTO warehouse_product_link (
		product_id, warehouse_id, stock_quantity
	) VALUES (
		:product_id, :warehouse_id, :stock_quantity)`

	for _, storage := range storages {
		warehouse := &models.Storage{
			ProductID:     productID,
			WarehouseID:   storage.WarehouseID,
			StockQuantity: storage.StockQuantity,
		}

		_, err := tx.NamedExec(query, warehouse)
		if err != nil {
			return errors.DatabaseError(err, "Create Product Warehouse")
		}
	}

	return nil
}
