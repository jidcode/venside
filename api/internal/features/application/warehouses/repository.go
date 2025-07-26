package warehouses

import (
	"database/sql"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type Repository struct {
	db    *sqlx.DB
	cache cache.RedisService
}

func NewRepository(db *sqlx.DB, cache cache.RedisService) WarehouseRepository {
	return &Repository{db: db, cache: cache}
}

func warehouseCacheKey(ID uuid.UUID) string {
	return "warehouse:" + ID.String()
}

func warehouseListCacheKey(inventoryID uuid.UUID) string {
	return "warehouses:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour
)

func (r *Repository) ListWarehouses(inventoryID uuid.UUID) ([]models.Warehouse, error) {
	key := warehouseListCacheKey(inventoryID)

	var cachedWarehouses []models.Warehouse
	if err := r.cache.Get(key, &cachedWarehouses); err == nil {
		return cachedWarehouses, nil
	}

	query := `SELECT * FROM warehouses WHERE inventory_id = $1 ORDER BY created_at DESC`
	warehouses := []models.Warehouse{}

	err := r.db.Select(&warehouses, query, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching warehouses")
	}

	if err := r.cache.Set(key, warehouses, TTL); err != nil {
		return warehouses, errors.CacheError(err, "Error caching warehouses")
	}

	return warehouses, nil
}

func (r *Repository) GetWarehouse(warehouseID uuid.UUID) (models.Warehouse, error) {
	key := warehouseCacheKey(warehouseID)

	var cachedWarehouse models.Warehouse
	if err := r.cache.Get(key, &cachedWarehouse); err == nil {
		return cachedWarehouse, nil
	}

	var warehouse models.Warehouse
	query := `SELECT * FROM warehouses WHERE id = $1`

	err := r.db.Get(&warehouse, query, warehouseID)
	if err != nil {
		if err == sql.ErrNoRows {
			return warehouse, errors.NotFoundError("Warehouse not found")
		}
		return warehouse, errors.DatabaseError(err, "Error getting warehouse by ID")
	}

	if err := r.cache.Set(key, warehouse, TTL); err != nil {
		return warehouse, errors.CacheError(err, "Error caching warehouse")
	}

	return warehouse, nil
}

func (r *Repository) GetWarehouseWithStock(warehouseID uuid.UUID) (models.Warehouse, error) {
	warehouse, err := r.GetWarehouse(warehouseID)
	if err != nil {
		return warehouse, err
	}

	// Products with stock quantities
	var productsWithStock []models.ProductWithStock
	query := `
		SELECT 
			p.id, p.name, p.code, p.sku, p.brand, p.model, p.description,
			p.total_quantity,p.restock_level, p.optimal_level, p.cost_price,
			p.selling_price, p.inventory_id, p.created_at, p.updated_at,
			wpl.stock_quantity
		FROM warehouse_product_link wpl
		JOIN products p ON wpl.product_id = p.id
		WHERE wpl.warehouse_id = $1
		ORDER BY p.name ASC
	`
	err = r.db.Select(&productsWithStock, query, warehouseID)
	if err != nil {
		return warehouse, errors.DatabaseError(err, "Error fetching products for warehouse")
	}

	var stockItems []models.StockItem
	for _, pws := range productsWithStock {
		stockItems = append(stockItems, models.StockItem{
			ProductID:     pws.ID,
			WarehouseID:   warehouseID,
			StockQuantity: pws.StockQuantity,
			Product: models.Product{
				ID:            pws.ID,
				Name:          pws.Name,
				Code:          pws.Code,
				SKU:           pws.SKU,
				Brand:         pws.Brand,
				Model:         pws.Model,
				Description:   pws.Description,
				TotalQuantity: pws.TotalQuantity,
				RestockLevel:  pws.RestockLevel,
				OptimalLevel:  pws.OptimalLevel,
				CostPrice:     pws.CostPrice,
				SellingPrice:  pws.SellingPrice,
				InventoryID:   pws.InventoryID,
				CreatedAt:     pws.CreatedAt,
				UpdatedAt:     pws.UpdatedAt,
			},
		})
	}
	warehouse.StockItems = stockItems

	return warehouse, nil
}

func (r *Repository) CreateWarehouse(warehouse *models.Warehouse) error {
	query := `
		INSERT INTO warehouses (
			id, name, location, capacity, storage_type, 
			manager, contact, inventory_id, 
			created_at, updated_at
		) VALUES (
			:id, :name, :location, :capacity, :storage_type,
			:manager, :contact, :inventory_id,
			:created_at, :updated_at
		)
	`
	_, err := r.db.NamedExec(query, warehouse)
	if err != nil {
		return errors.DatabaseError(err, "Error creating warehouse")
	}

	r.invalidateWarehouseCaches(warehouse.ID, warehouse.InventoryID)

	return nil
}

func (r *Repository) UpdateWarehouse(warehouse *models.Warehouse) error {
	query := `
		UPDATE warehouses SET 
			name = :name,
			location = :location,
			capacity = :capacity,
			storage_type = :storage_type,
			manager = :manager,
			contact = :contact,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.NamedExec(query, warehouse)
	if err != nil {
		return errors.DatabaseError(err, "Error updating warehouse")
	}

	r.invalidateWarehouseCaches(warehouse.ID, warehouse.InventoryID)

	return nil
}

func (r *Repository) DeleteWarehouse(warehouseID uuid.UUID) error {
	warehouse, err := r.GetWarehouse(warehouseID)
	if err != nil {
		return err
	}

	query := `DELETE FROM warehouses WHERE id = $1`
	_, err = r.db.Exec(query, warehouseID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting warehouse")
	}

	r.invalidateWarehouseCaches(warehouseID, warehouse.InventoryID)

	return nil
}

// //
func (r *Repository) AddProductsToWarehouse(warehouseID uuid.UUID, stockItems []models.StockItemRequest) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	query := `
		INSERT INTO warehouse_product_link (product_id, warehouse_id, stock_quantity)
		VALUES (:product_id, :warehouse_id, :stock_quantity)
		ON CONFLICT (product_id, warehouse_id) DO UPDATE 
		SET stock_quantity = EXCLUDED.stock_quantity
	`

	for _, item := range stockItems {
		params := map[string]interface{}{
			"product_id":     item.ProductID,
			"warehouse_id":   warehouseID,
			"stock_quantity": item.StockQuantity,
		}
		if _, err := tx.NamedExec(query, params); err != nil {
			return errors.DatabaseError(err, "Error adding product to warehouse")
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.cache.Delete(warehouseCacheKey(warehouseID))
	return nil
}

func (r *Repository) RemoveProductsFromWarehouse(warehouseID uuid.UUID, productIDs []uuid.UUID) error {
	query := `DELETE FROM warehouse_product_link WHERE warehouse_id = $1 AND product_id = ANY($2)`

	_, err := r.db.Exec(query, warehouseID, pq.Array(productIDs))
	if err != nil {
		return errors.DatabaseError(err, "Error removing products from warehouse")
	}

	r.cache.Delete(warehouseCacheKey(warehouseID))
	return nil
}

func (r *Repository) UpdateStockQuantity(warehouseID, productID uuid.UUID, quantity int) error {
	query := `
		UPDATE warehouse_product_link 
		SET stock_quantity = $1
		WHERE warehouse_id = $2 AND product_id = $3
	`

	res, err := r.db.Exec(query, quantity, warehouseID, productID)
	if err != nil {
		return errors.DatabaseError(err, "Error updating stock quantity")
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.NotFoundError("No such warehouse-product record found")
	}

	r.cache.Delete(warehouseCacheKey(warehouseID))
	return nil
}

func (r *Repository) TransferProducts(fromWarehouseID, toWarehouseID uuid.UUID, transferItems []models.StockItemRequest) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transfer transaction")
	}
	defer tx.Rollback()

	for _, item := range transferItems {
		// 1. Deduct from source warehouse
		deductQuery := `
			UPDATE warehouse_product_link
			SET stock_quantity = stock_quantity - $1
			WHERE warehouse_id = $2 AND product_id = $3 AND stock_quantity >= $1
		`
		res, err := tx.Exec(deductQuery, item.StockQuantity, fromWarehouseID, item.ProductID)
		if err != nil {
			return errors.DatabaseError(err, "Error deducting stock from source warehouse")
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			return errors.ValidationError("Insufficient stock or product not found in source warehouse")
		}

		// 2. Add to destination warehouse
		addQuery := `
			INSERT INTO warehouse_product_link (product_id, warehouse_id, stock_quantity)
			VALUES (:product_id, :warehouse_id, :stock_quantity)
			ON CONFLICT (product_id, warehouse_id) DO UPDATE
			SET stock_quantity = warehouse_product_link.stock_quantity + EXCLUDED.stock_quantity
		`

		params := map[string]interface{}{
			"product_id":     item.ProductID,
			"warehouse_id":   toWarehouseID,
			"stock_quantity": item.StockQuantity,
		}

		if _, err := tx.NamedExec(addQuery, params); err != nil {
			return errors.DatabaseError(err, "Error adding stock to destination warehouse")
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transfer transaction")
	}

	// Invalidate both warehouse caches
	r.cache.Delete(warehouseCacheKey(fromWarehouseID))
	r.cache.Delete(warehouseCacheKey(toWarehouseID))

	return nil
}

func (r *Repository) invalidateWarehouseCaches(warehouseID, inventoryID uuid.UUID) {
	r.cache.Delete(warehouseCacheKey(warehouseID))
	r.cache.Delete(warehouseListCacheKey(inventoryID))
}
