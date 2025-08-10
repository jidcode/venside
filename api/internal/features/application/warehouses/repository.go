package warehouses

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
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

// Warehouse Operations

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

	var products []models.ProductWithStock
	query := `
        SELECT 
            p.id, p.name, p.code, p.sku, p.brand, p.model, p.description,
            p.total_quantity, p.total_stock, p.restock_level, p.optimal_level, 
            p.cost_price, p.selling_price, p.inventory_id, 
            p.created_at, p.updated_at,
            wpl.quantity_in_stock
        FROM warehouse_product_link wpl
        JOIN products p ON wpl.product_id = p.id
        WHERE wpl.warehouse_id = $1
        ORDER BY p.name ASC
    `
	err = r.db.Select(&products, query, warehouseID)
	if err != nil {
		return warehouse, errors.DatabaseError(err, "Error fetching products for warehouse")
	}

	warehouse.StockItems = mapper.ToProductStock(products)
	return warehouse, nil
}

func (r *Repository) CreateWarehouse(warehouse *models.Warehouse) error {
	query := `
		INSERT INTO warehouses (
			id, name, location, capacity, storage_type, 
			is_main, manager, phone, email, inventory_id, 
			created_at, updated_at
		) VALUES (
			:id, :name, :location, :capacity, :storage_type,
			:is_main, :manager, :phone, :email, :inventory_id,
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
			is_main = :is_main,
			manager = :manager,
			phone = :phone,
			email = :email,
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

func (r *Repository) DeleteWarehouse(warehouseID, inventoryID uuid.UUID) error {
	query := `DELETE FROM warehouses WHERE id = $1`
	_, err := r.db.Exec(query, warehouseID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting warehouse")
	}

	r.invalidateWarehouseCaches(warehouseID, inventoryID)

	return nil
}

// Stock Item Operations

func (r *Repository) AddProductsToWarehouse(warehouseID, inventoryID uuid.UUID, items []models.StockItemRequest) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	for _, item := range items {
		// Insert or update warehouse_product_link with the new quantity
		query := `
            INSERT INTO warehouse_product_link (product_id, warehouse_id, quantity_in_stock)
            VALUES (:product_id, :warehouse_id, :quantity_in_stock)
            ON CONFLICT (product_id, warehouse_id) 
            DO UPDATE SET 
                quantity_in_stock = warehouse_product_link.quantity_in_stock + :quantity_in_stock
        `

		params := map[string]interface{}{
			"product_id":        item.ProductID,
			"warehouse_id":      warehouseID,
			"quantity_in_stock": item.QuantityInStock,
		}

		_, err = tx.NamedExec(query, params)
		if err != nil {
			return errors.DatabaseError(err, "Error adding product to warehouse")
		}

		// Update the product's total_stock
		updateProductQuery := `
            UPDATE products 
            SET total_stock = total_stock + :quantity_in_stock
            WHERE id = :product_id
        `

		updateParams := map[string]interface{}{
			"quantity_in_stock": item.QuantityInStock,
			"product_id":        item.ProductID,
		}

		_, err = tx.NamedExec(updateProductQuery, updateParams)
		if err != nil {
			return errors.DatabaseError(err, "Error updating product total stock")
		}
	}

	if err = tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateWarehouseCaches(warehouseID, inventoryID)
	return nil
}

func (r *Repository) RemoveProductFromWarehouse(inventoryID, warehouseID, productID uuid.UUID) error {
	// Get current quantity (if exists)
	var currentQuantity int
	err := r.db.Get(&currentQuantity,
		`SELECT COALESCE(quantity_in_stock, 0) 
         FROM warehouse_product_link 
         WHERE warehouse_id = $1 AND product_id = $2`,
		warehouseID, productID)
	if err != nil && err != sql.ErrNoRows {
		return errors.DatabaseError(err, "Error checking product stock")
	}

	// If no quantity, nothing to do
	if currentQuantity == 0 {
		return nil
	}

	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	// Remove from warehouse
	_, err = tx.Exec(
		`DELETE FROM warehouse_product_link 
         WHERE warehouse_id = $1 AND product_id = $2`,
		warehouseID, productID)
	if err != nil {
		return errors.DatabaseError(err, "Error removing product")
	}

	// Update product total_stock
	_, err = tx.Exec(
		`UPDATE products 
         SET total_stock = total_stock - $1 
         WHERE id = $2`,
		currentQuantity, productID)
	if err != nil {
		return errors.DatabaseError(err, "Error updating product total stock")
	}

	if err = tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateWarehouseCaches(warehouseID, inventoryID)
	return nil
}

func (r *Repository) TransferWarehouseStock(inventoryID uuid.UUID, fromWarehouseID, toWarehouseID uuid.UUID, items []models.TransferItemRequest) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	for _, item := range items {
		// First, check if the source warehouse has enough stock
		var currentStock int
		err = tx.Get(&currentStock,
			`SELECT COALESCE(quantity_in_stock, 0) 
             FROM warehouse_product_link 
             WHERE warehouse_id = $1 AND product_id = $2`,
			fromWarehouseID, item.ProductID)
		if err != nil && err != sql.ErrNoRows {
			return errors.DatabaseError(err, "Error checking source warehouse stock")
		}

		// Validate sufficient stock
		if currentStock < item.TransferQuantity {
			return errors.ValidationError(fmt.Sprintf("Insufficient stock for product %s. Available: %d, Requested: %d",
				item.ProductID, currentStock, item.TransferQuantity))
		}

		// Reduce stock from source warehouse
		_, err = tx.Exec(
			`UPDATE warehouse_product_link 
             SET quantity_in_stock = quantity_in_stock - $1 
             WHERE warehouse_id = $2 AND product_id = $3`,
			item.TransferQuantity, fromWarehouseID, item.ProductID)
		if err != nil {
			return errors.DatabaseError(err, "Error reducing stock from source warehouse")
		}

		// Remove the product from source warehouse if stock becomes 0
		_, err = tx.Exec(
			`DELETE FROM warehouse_product_link 
             WHERE warehouse_id = $1 AND product_id = $2 AND quantity_in_stock = 0`,
			fromWarehouseID, item.ProductID)
		if err != nil {
			return errors.DatabaseError(err, "Error cleaning up zero stock from source warehouse")
		}

		// Add or update stock in destination warehouse
		_, err = tx.NamedExec(
			`INSERT INTO warehouse_product_link (product_id, warehouse_id, quantity_in_stock)
             VALUES (:product_id, :warehouse_id, :quantity_in_stock)
             ON CONFLICT (product_id, warehouse_id) 
             DO UPDATE SET 
                 quantity_in_stock = warehouse_product_link.quantity_in_stock + :quantity_in_stock`,
			map[string]interface{}{
				"product_id":        item.ProductID,
				"warehouse_id":      toWarehouseID,
				"quantity_in_stock": item.TransferQuantity,
			})
		if err != nil {
			return errors.DatabaseError(err, "Error adding stock to destination warehouse")
		}

		// Note: For transfers, we don't update the product's total_stock
		// because the total stock across all warehouses remains the same
	}

	if err = tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	// Invalidate caches for both warehouses
	r.invalidateWarehouseCaches(fromWarehouseID, inventoryID)
	r.invalidateWarehouseCaches(toWarehouseID, inventoryID)

	return nil
}

func (r *Repository) UpdateStockQuantity(inventoryID, warehouseID, productID uuid.UUID, newQuantity int) error {
	// Get current product and stock information
	var current struct {
		WarehouseStock int       `db:"warehouse_stock"`
		TotalQuantity  int       `db:"total_quantity"`
		TotalStock     int       `db:"total_stock"`
		InventoryID    uuid.UUID `db:"inventory_id"`
	}

	err := r.db.Get(&current,
		`SELECT 
            COALESCE(wpl.quantity_in_stock, 0) as warehouse_stock,
            p.total_quantity,
            p.total_stock,
            p.inventory_id
         FROM products p
         LEFT JOIN warehouse_product_link wpl ON 
            wpl.product_id = p.id AND 
            wpl.warehouse_id = $1
         WHERE p.id = $2`,
		warehouseID, productID)

	if err != nil {
		if err == sql.ErrNoRows {
			return errors.ValidationError("Product not found")
		}
		return errors.DatabaseError(err, "Error retrieving product stock data")
	}

	// Verify product belongs to the correct inventory
	if current.InventoryID != inventoryID {
		return errors.ValidationError("Product does not belong to specified inventory")
	}

	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	// Calculate the global stock difference
	stockDifference := newQuantity - current.WarehouseStock

	// Update total_quantity if new quantity exceeds it
	if newQuantity > current.TotalQuantity {
		_, err = tx.Exec(
			`UPDATE products 
             SET total_quantity = $1 
             WHERE id = $2`,
			newQuantity, productID)
		if err != nil {
			return errors.DatabaseError(err, "Error updating product total quantity")
		}
	}

	// Update or delete warehouse stock record
	if newQuantity == 0 {
		_, err = tx.Exec(
			`DELETE FROM warehouse_product_link 
             WHERE warehouse_id = $1 AND product_id = $2`,
			warehouseID, productID)
	} else if current.WarehouseStock == 0 {
		_, err = tx.Exec(
			`INSERT INTO warehouse_product_link 
             (product_id, warehouse_id, quantity_in_stock)
             VALUES ($1, $2, $3)`,
			productID, warehouseID, newQuantity)
	} else {
		_, err = tx.Exec(
			`UPDATE warehouse_product_link 
             SET quantity_in_stock = $1 
             WHERE warehouse_id = $2 AND product_id = $3`,
			newQuantity, warehouseID, productID)
	}

	if err != nil {
		return errors.DatabaseError(err, "Error updating warehouse stock")
	}

	// Update product's total stock if changed
	if stockDifference != 0 {
		_, err = tx.Exec(
			`UPDATE products 
             SET total_stock = total_stock + $1 
             WHERE id = $2`,
			stockDifference, productID)
		if err != nil {
			return errors.DatabaseError(err, "Error updating product total stock")
		}
	}

	if err = tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateWarehouseCaches(warehouseID, inventoryID)
	return nil
}

func (r *Repository) invalidateWarehouseCaches(warehouseID, inventoryID uuid.UUID) {
	r.cache.Delete(warehouseCacheKey(warehouseID))
	r.cache.Delete(warehouseListCacheKey(inventoryID))
}
