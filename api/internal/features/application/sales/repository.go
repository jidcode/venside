package sales

import (
	"database/sql"
	"fmt"
	"math/rand"
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

func NewRepository(db *sqlx.DB, cache cache.RedisService) SaleRepository {
	return &Repository{db: db, cache: cache}
}

func saleCacheKey(ID uuid.UUID) string {
	return "sale:" + ID.String()
}

func saleListCacheKey(inventoryID uuid.UUID) string {
	return "sales:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour
)

func (r *Repository) ListSales(inventoryID uuid.UUID) ([]models.Sale, error) {
	key := saleListCacheKey(inventoryID)

	var cachedSales []models.Sale
	if err := r.cache.Get(key, &cachedSales); err == nil {
		return cachedSales, nil
	}

	// First get all sales
	salesQuery := `SELECT * FROM sales WHERE inventory_id = $1 ORDER BY created_at DESC`
	sales := []models.Sale{}

	err := r.db.Select(&sales, salesQuery, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching sales")
	}

	// For each sale, get its items with product details
	for i := range sales {
		itemsQuery := `
			SELECT 
				si.id, si.sale_id, si.product_id, si.quantity, 
				si.unit_price, si.subtotal, si.discount_amount, 
				si.discount_percent, si.created_at,
				p.id as "product.id", p.name as "product.name", 
				p.code as "product.code", p.sku as "product.sku",
				p.brand as "product.brand", p.model as "product.model",
				p.description as "product.description", p.total_quantity as "product.total_quantity",
				p.total_stock as "product.total_stock", p.restock_level as "product.restock_level",
				p.optimal_level as "product.optimal_level", p.cost_price as "product.cost_price",
				p.selling_price as "product.selling_price", p.inventory_id as "product.inventory_id",
				p.created_at as "product.created_at", p.updated_at as "product.updated_at"
			FROM sale_items si
			LEFT JOIN products p ON si.product_id = p.id
			WHERE si.sale_id = $1
			ORDER BY si.created_at ASC
		`

		type SaleItemWithProduct struct {
			models.SaleItem
			Product models.Product
		}

		var itemsWithProducts []SaleItemWithProduct
		err := r.db.Select(&itemsWithProducts, itemsQuery, sales[i].ID)
		if err != nil {
			return nil, errors.DatabaseError(err, "Error fetching sale items")
		}

		// Convert to SaleItems with Product pointers
		items := make([]models.SaleItem, len(itemsWithProducts))
		for j, itemWithProduct := range itemsWithProducts {
			items[j] = itemWithProduct.SaleItem
			if itemWithProduct.Product.ID != uuid.Nil {
				items[j].Product = &itemWithProduct.Product
			}
		}

		sales[i].Items = items
	}

	if err := r.cache.Set(key, sales, TTL); err != nil {
		return sales, errors.CacheError(err, "Error caching sales")
	}

	return sales, nil
}

func (r *Repository) GetSale(saleID uuid.UUID) (models.Sale, error) {
	key := saleCacheKey(saleID)

	var cachedSale models.Sale
	if err := r.cache.Get(key, &cachedSale); err == nil {
		return cachedSale, nil
	}

	var sale models.Sale
	query := `SELECT * FROM sales WHERE id = $1`

	err := r.db.Get(&sale, query, saleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return sale, errors.NotFoundError("Sale not found")
		}
		return sale, errors.DatabaseError(err, "Error getting sale by ID")
	}

	itemsQuery := `
		SELECT 
			si.id, si.sale_id, si.product_id, si.quantity, 
			si.unit_price, si.subtotal, si.discount_amount, 
			si.discount_percent, si.created_at,
			p.id as "product.id", p.name as "product.name", 
			p.code as "product.code", p.sku as "product.sku",
			p.brand as "product.brand", p.model as "product.model",
			p.description as "product.description", p.total_quantity as "product.total_quantity",
			p.total_stock as "product.total_stock", p.restock_level as "product.restock_level",
			p.optimal_level as "product.optimal_level", p.cost_price as "product.cost_price",
			p.selling_price as "product.selling_price", p.inventory_id as "product.inventory_id",
			p.created_at as "product.created_at", p.updated_at as "product.updated_at"
		FROM sale_items si
		LEFT JOIN products p ON si.product_id = p.id
		WHERE si.sale_id = $1
		ORDER BY si.created_at ASC
	`

	type SaleItemWithProduct struct {
		models.SaleItem
		Product models.Product
	}

	var itemsWithProducts []SaleItemWithProduct
	err = r.db.Select(&itemsWithProducts, itemsQuery, saleID)
	if err != nil {
		return sale, errors.DatabaseError(err, "Error fetching sale items")
	}

	// Convert to SaleItems with Product pointers
	items := make([]models.SaleItem, len(itemsWithProducts))
	for i, itemWithProduct := range itemsWithProducts {
		items[i] = itemWithProduct.SaleItem
		if itemWithProduct.Product.ID != uuid.Nil {
			items[i].Product = &itemWithProduct.Product
		}
	}

	sale.Items = items

	if err := r.cache.Set(key, sale, TTL); err != nil {
		return sale, errors.CacheError(err, "Error caching sale")
	}

	return sale, nil
}

func (r *Repository) CreateSale(sale *models.Sale) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	saleNumber, err := r.generateSaleNumber(sale.SaleDate)
	if err != nil {
		return err
	}
	sale.SaleNumber = saleNumber

	// Insert sale
	saleQuery := `
		INSERT INTO sales (
			id, sale_number, customer_id, customer_name, sale_date,
			total_amount, balance, payment_status, discount_amount,
			discount_percent, inventory_id, created_at, updated_at
		) VALUES (
			:id, :sale_number, :customer_id, :customer_name, :sale_date,
			:total_amount, :balance, :payment_status, :discount_amount,
			:discount_percent, :inventory_id, :created_at, :updated_at
		)
	`
	_, err = tx.NamedExec(saleQuery, sale)
	if err != nil {
		return errors.DatabaseError(err, "Error creating sale")
	}

	// Insert sale items
	if len(sale.Items) > 0 {
		itemQuery := `
			INSERT INTO sale_items (
				id, sale_id, product_id, quantity, unit_price,
				subtotal, discount_amount, discount_percent, created_at
			) VALUES (
				:id, :sale_id, :product_id, :quantity, :unit_price,
				:subtotal, :discount_amount, :discount_percent, :created_at
			)
		`
		for _, item := range sale.Items {
			_, err = tx.NamedExec(itemQuery, item)
			if err != nil {
				return errors.DatabaseError(err, "Error creating sale item")
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateSaleCaches(sale.ID, sale.InventoryID)

	return nil
}

func (r *Repository) UpdateSale(sale *models.Sale) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	// Update sale
	saleQuery := `
		UPDATE sales SET 
			customer_id = :customer_id,
			customer_name = :customer_name,
			sale_date = :sale_date,
			total_amount = :total_amount,
			balance = :balance,
			payment_status = :payment_status,
			discount_amount = :discount_amount,
			discount_percent = :discount_percent,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err = tx.NamedExec(saleQuery, sale)
	if err != nil {
		return errors.DatabaseError(err, "Error updating sale")
	}

	// Delete existing sale items
	_, err = tx.Exec("DELETE FROM sale_items WHERE sale_id = $1", sale.ID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting existing sale items")
	}

	// Insert new sale items
	if len(sale.Items) > 0 {
		itemQuery := `
			INSERT INTO sale_items (
				id, sale_id, product_id, quantity, unit_price,
				subtotal, discount_amount, discount_percent, created_at
			) VALUES (
				:id, :sale_id, :product_id, :quantity, :unit_price,
				:subtotal, :discount_amount, :discount_percent, :created_at
			)
		`
		for _, item := range sale.Items {
			_, err = tx.NamedExec(itemQuery, item)
			if err != nil {
				return errors.DatabaseError(err, "Error creating sale item")
			}
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateSaleCaches(sale.ID, sale.InventoryID)

	return nil
}

func (r *Repository) DeleteSale(saleID, inventoryID uuid.UUID) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	// Delete sale items first (due to foreign key constraint)
	_, err = tx.Exec("DELETE FROM sale_items WHERE sale_id = $1", saleID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting sale items")
	}

	// Delete sale
	_, err = tx.Exec("DELETE FROM sales WHERE id = $1", saleID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting sale")
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidateSaleCaches(saleID, inventoryID)

	return nil
}

// Helper methods
func (r *Repository) invalidateSaleCaches(saleID, inventoryID uuid.UUID) {
	r.cache.Delete(saleCacheKey(saleID))
	r.cache.Delete(saleListCacheKey(inventoryID))
}

func (repo *Repository) generateSaleNumber(saleDate time.Time) (string, error) {
	dateStr := saleDate.Format("060102") // YYMMDD format

	// Get count of sales for the given date
	var count int
	query := `SELECT COUNT(*) FROM sales WHERE DATE(sale_date) = DATE($1)`
	if err := repo.db.Get(&count, query, saleDate.Format("2006-01-02")); err != nil {
		return "", errors.DatabaseError(err, "Error getting sale count")
	}

	// Try to generate unique sale number with sequential numbering (max 10 attempts)
	for i := 0; i < 10; i++ {
		seqNumber := count + 1 + i
		candidateNumber := fmt.Sprintf("SO-%s-%03d", dateStr, seqNumber)

		var exists bool
		existsQuery := `SELECT EXISTS(SELECT 1 FROM sales WHERE sale_number = $1)`
		if err := repo.db.Get(&exists, existsQuery, candidateNumber); err != nil {
			return "", errors.DatabaseError(err, "Error checking sale number uniqueness")
		}

		if !exists {
			return candidateNumber, nil
		}
	}

	// Fallback: Generate random date-like digits and start from 001
	randomDate := fmt.Sprintf("%06d", rand.Intn(1000000))
	fallbackNumber := fmt.Sprintf("SO-%s-001", randomDate)

	return fallbackNumber, nil
}
