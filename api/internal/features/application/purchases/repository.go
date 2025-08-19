package purchases

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

func NewRepository(db *sqlx.DB, cache cache.RedisService) PurchaseRepository {
	return &Repository{db: db, cache: cache}
}

func purchaseCacheKey(ID uuid.UUID) string {
	return "purchase:" + ID.String()
}

func purchaseListCacheKey(inventoryID uuid.UUID) string {
	return "purchases:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour
)

func (r *Repository) ListPurchases(inventoryID uuid.UUID) ([]models.Purchase, error) {
	key := purchaseListCacheKey(inventoryID)

	var cachedPurchases []models.Purchase
	if err := r.cache.Get(key, &cachedPurchases); err == nil {
		return cachedPurchases, nil
	}

	purchasesQuery := `SELECT * FROM purchases WHERE inventory_id = $1 ORDER BY created_at DESC`
	purchases := []models.Purchase{}

	err := r.db.Select(&purchases, purchasesQuery, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching purchases")
	}

	for i := range purchases {
		itemsQuery := `
    SELECT 
        pi.id, pi.purchase_id, pi.product_id, pi.quantity, 
        pi.unit_price, pi.subtotal, pi.created_at,
        p.id as "product.id", p.name as "product.name", 
        p.code as "product.code", p.sku as "product.sku",
        p.brand as "product.brand", p.model as "product.model",
        p.description as "product.description", p.total_quantity as "product.total_quantity",
        p.total_stock as "product.total_stock", p.restock_level as "product.restock_level",
        p.optimal_level as "product.optimal_level", p.cost_price as "product.cost_price",
        p.selling_price as "product.selling_price", p.inventory_id as "product.inventory_id",
        p.created_at as "product.created_at", p.updated_at as "product.updated_at"
    FROM purchase_items pi
    LEFT JOIN products p ON pi.product_id = p.id
    WHERE pi.purchase_id = $1
    ORDER BY pi.created_at ASC
`

		type PurchaseItemWithProduct struct {
			models.PurchaseItem
			Product models.Product
		}

		var itemsWithProducts []PurchaseItemWithProduct
		err := r.db.Select(&itemsWithProducts, itemsQuery, purchases[i].ID)
		if err != nil {
			return nil, errors.DatabaseError(err, "Error fetching purchase items")
		}

		items := make([]models.PurchaseItem, len(itemsWithProducts))
		for j, itemWithProduct := range itemsWithProducts {
			items[j] = itemWithProduct.PurchaseItem
			if itemWithProduct.Product.ID != uuid.Nil {
				items[j].Product = &itemWithProduct.Product
			}
		}

		purchases[i].Items = items
	}

	if err := r.cache.Set(key, purchases, TTL); err != nil {
		return purchases, errors.CacheError(err, "Error caching purchases")
	}

	return purchases, nil
}

func (r *Repository) GetPurchase(purchaseID uuid.UUID) (models.Purchase, error) {
	key := purchaseCacheKey(purchaseID)

	var cachedPurchase models.Purchase
	if err := r.cache.Get(key, &cachedPurchase); err == nil {
		return cachedPurchase, nil
	}

	var purchase models.Purchase
	query := `SELECT * FROM purchases WHERE id = $1`

	err := r.db.Get(&purchase, query, purchaseID)
	if err != nil {
		if err == sql.ErrNoRows {
			return purchase, errors.NotFoundError("Purchase not found")
		}
		return purchase, errors.DatabaseError(err, "Error getting purchase by ID")
	}

	itemsQuery := `
    SELECT 
        pi.id, pi.purchase_id, pi.product_id, pi.quantity, 
        pi.unit_price, pi.subtotal, pi.created_at,
        p.id as "product.id", p.name as "product.name", 
        p.code as "product.code", p.sku as "product.sku",
        p.brand as "product.brand", p.model as "product.model",
        p.description as "product.description", p.total_quantity as "product.total_quantity",
        p.total_stock as "product.total_stock", p.restock_level as "product.restock_level",
        p.optimal_level as "product.optimal_level", p.cost_price as "product.cost_price",
        p.selling_price as "product.selling_price", p.inventory_id as "product.inventory_id",
        p.created_at as "product.created_at", p.updated_at as "product.updated_at"
    FROM purchase_items pi
    LEFT JOIN products p ON pi.product_id = p.id
    WHERE pi.purchase_id = $1
    ORDER BY pi.created_at ASC
`

	type PurchaseItemWithProduct struct {
		models.PurchaseItem
		Product models.Product
	}

	var itemsWithProducts []PurchaseItemWithProduct
	err = r.db.Select(&itemsWithProducts, itemsQuery, purchaseID)
	if err != nil {
		return purchase, errors.DatabaseError(err, "Error fetching purchase items")
	}

	items := make([]models.PurchaseItem, len(itemsWithProducts))
	for i, itemWithProduct := range itemsWithProducts {
		items[i] = itemWithProduct.PurchaseItem
		if itemWithProduct.Product.ID != uuid.Nil {
			items[i].Product = &itemWithProduct.Product
		}
	}

	purchase.Items = items

	if err := r.cache.Set(key, purchase, TTL); err != nil {
		return purchase, errors.CacheError(err, "Error caching purchase")
	}

	return purchase, nil
}

func (r *Repository) CreatePurchase(purchase *models.Purchase) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	purchaseNumber, err := r.generatePurchaseNumber(purchase.PurchaseDate)
	if err != nil {
		return err
	}
	purchase.PurchaseNumber = purchaseNumber

	purchaseQuery := `
		INSERT INTO purchases (
			id, purchase_number, vendor_id, purchase_date, eta,
			delivery_date, shipping_cost, total_amount, payment_status,
			purchase_status, discount_amount, discount_percent, inventory_id, 
			created_at, updated_at
		) VALUES (
			:id, :purchase_number, :vendor_id, :purchase_date, :eta,
			:delivery_date, :shipping_cost, :total_amount, :payment_status,
			:purchase_status, :discount_amount, :discount_percent, :inventory_id, 
			:created_at, :updated_at
		)
	`
	_, err = tx.NamedExec(purchaseQuery, purchase)
	if err != nil {
		return errors.DatabaseError(err, "Error creating purchase")
	}

	if len(purchase.Items) > 0 {
		itemQuery := `
			INSERT INTO purchase_items (
				id, purchase_id, product_id, quantity, unit_price, subtotal, created_at
			) VALUES (
				:id, :purchase_id, :product_id, :quantity, :unit_price, :subtotal, :created_at
			)
		`
		for _, item := range purchase.Items {
			_, err = tx.NamedExec(itemQuery, item)
			if err != nil {
				return errors.DatabaseError(err, "Error creating purchase item")
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidatePurchaseCaches(purchase.ID, purchase.InventoryID)

	return nil
}

func (r *Repository) DeletePurchase(purchaseID, inventoryID uuid.UUID) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return errors.DatabaseError(err, "Error starting transaction")
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM purchase_items WHERE purchase_id = $1", purchaseID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting purchase items")
	}

	_, err = tx.Exec("DELETE FROM purchases WHERE id = $1", purchaseID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting purchase")
	}

	if err := tx.Commit(); err != nil {
		return errors.DatabaseError(err, "Error committing transaction")
	}

	r.invalidatePurchaseCaches(purchaseID, inventoryID)

	return nil
}

// HELPER METHODS
func (r *Repository) invalidatePurchaseCaches(purchaseID, inventoryID uuid.UUID) {
	r.cache.Delete(purchaseCacheKey(purchaseID))
	r.cache.Delete(purchaseListCacheKey(inventoryID))
}

func (repo *Repository) generatePurchaseNumber(purchaseDate time.Time) (string, error) {
	dateStr := purchaseDate.Format("060102")

	var count int
	query := `SELECT COUNT(*) FROM purchases WHERE DATE(purchase_date) = DATE($1)`
	if err := repo.db.Get(&count, query, purchaseDate.Format("2006-01-02")); err != nil {
		return "", errors.DatabaseError(err, "Error getting purchase count")
	}

	for i := 0; i < 10; i++ {
		seqNumber := count + 1 + i
		candidateNumber := fmt.Sprintf("PO-%s-%03d", dateStr, seqNumber)

		var exists bool
		existsQuery := `SELECT EXISTS(SELECT 1 FROM purchases WHERE purchase_number = $1)`
		if err := repo.db.Get(&exists, existsQuery, candidateNumber); err != nil {
			return "", errors.DatabaseError(err, "Error checking purchase number uniqueness")
		}

		if !exists {
			return candidateNumber, nil
		}
	}

	fallbackNumber := fmt.Sprintf("PO-%06d-001", rand.Intn(1000000))

	return fallbackNumber, nil
}
