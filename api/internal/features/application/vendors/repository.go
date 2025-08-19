package vendors

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

func NewRepository(db *sqlx.DB, cache cache.RedisService) VendorRepository {
	return &Repository{db: db, cache: cache}
}

func vendorCacheKey(ID uuid.UUID) string {
	return "vendor:" + ID.String()
}

func vendorListCacheKey(inventoryID uuid.UUID) string {
	return "vendors:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour
)

func (r *Repository) ListVendors(inventoryID uuid.UUID) ([]models.Vendor, error) {
	key := vendorListCacheKey(inventoryID)

	var cachedVendors []models.Vendor
	if err := r.cache.Get(key, &cachedVendors); err == nil {
		return cachedVendors, nil
	}

	query := `SELECT * FROM vendors WHERE inventory_id = $1 ORDER BY created_at DESC`
	vendors := []models.Vendor{}

	err := r.db.Select(&vendors, query, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching vendors")
	}

	if err := r.cache.Set(key, vendors, TTL); err != nil {
		return vendors, errors.CacheError(err, "Error caching vendors")
	}

	return vendors, nil
}

func (r *Repository) GetVendor(vendorID uuid.UUID) (models.Vendor, error) {
	key := vendorCacheKey(vendorID)

	var cachedVendor models.Vendor
	if err := r.cache.Get(key, &cachedVendor); err == nil {
		return cachedVendor, nil
	}

	var vendor models.Vendor
	query := `SELECT * FROM vendors WHERE id = $1`

	err := r.db.Get(&vendor, query, vendorID)
	if err != nil {
		if err == sql.ErrNoRows {
			return vendor, errors.NotFoundError("Vendor not found")
		}
		return vendor, errors.DatabaseError(err, "Error getting vendor by ID")
	}

	if err := r.cache.Set(key, vendor, TTL); err != nil {
		return vendor, errors.CacheError(err, "Error caching vendor")
	}

	return vendor, nil
}

func (r *Repository) CreateVendor(vendor *models.Vendor) error {
	query := `
		INSERT INTO vendors (
			id, company_name, contact_name, email, phone, 
			website, address, inventory_id, 
			created_at, updated_at
		) VALUES (
			:id, :company_name, :contact_name, :email, :phone,
			:website, :address, :inventory_id,
			:created_at, :updated_at
		)
	`
	_, err := r.db.NamedExec(query, vendor)
	if err != nil {
		return errors.DatabaseError(err, "Error creating vendor")
	}

	r.invalidateVendorCaches(vendor.ID, vendor.InventoryID)

	return nil
}

func (r *Repository) UpdateVendor(vendor *models.Vendor) error {
	query := `
		UPDATE vendors SET 
			company_name = :company_name,
			contact_name = :contact_name,
			email = :email,
			phone = :phone,
			website = :website,
			address = :address,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.NamedExec(query, vendor)
	if err != nil {
		return errors.DatabaseError(err, "Error updating vendor")
	}

	r.invalidateVendorCaches(vendor.ID, vendor.InventoryID)

	return nil
}

func (r *Repository) DeleteVendor(vendorID, inventoryID uuid.UUID) error {
	query := `DELETE FROM vendors WHERE id = $1`
	_, err := r.db.Exec(query, vendorID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting vendor")
	}

	r.invalidateVendorCaches(vendorID, inventoryID)

	return nil
}

func (r *Repository) invalidateVendorCaches(vendorID, inventoryID uuid.UUID) {
	r.cache.Delete(vendorCacheKey(vendorID))
	r.cache.Delete(vendorListCacheKey(inventoryID))
}
