package warehouses

import (
	"database/sql"
	"time"

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
	type ProductWithStock struct {
		ID            uuid.UUID `db:"id"`
		Name          string    `db:"name"`
		Code          string    `db:"code"`
		SKU           string    `db:"sku"`
		Brand         string    `db:"brand"`
		Model         string    `db:"model"`
		Description   string    `db:"description"`
		TotalQuantity int       `db:"total_quantity"`
		RestockLevel  int       `db:"restock_level"`
		OptimalLevel  int       `db:"optimal_level"`
		CostPrice     int       `db:"cost_price"`
		SellingPrice  int       `db:"selling_price"`
		InventoryID   uuid.UUID `db:"inventory_id"`
		CreatedAt     time.Time `db:"created_at"`
		UpdatedAt     time.Time `db:"updated_at"`
		StockQuantity int       `db:"stock_quantity"`
	}

	var productsWithStock []ProductWithStock
	query := `
		SELECT 
			p.id,
			p.name,
			p.code,
			p.sku,
			p.brand,
			p.model,
			p.description,
			p.total_quantity,
			p.restock_level,
			p.optimal_level,
			p.cost_price,
			p.selling_price,
			p.inventory_id,
			p.created_at,
			p.updated_at,
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

func (r *Repository) invalidateWarehouseCaches(warehouseID, inventoryID uuid.UUID) {
	r.cache.Delete(warehouseCacheKey(warehouseID))
	r.cache.Delete(warehouseListCacheKey(inventoryID))
}
