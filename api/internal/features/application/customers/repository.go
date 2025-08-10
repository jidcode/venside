package customers

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

func NewRepository(db *sqlx.DB, cache cache.RedisService) CustomerRepository {
	return &Repository{db: db, cache: cache}
}

func customerCacheKey(ID uuid.UUID) string {
	return "customer:" + ID.String()
}

func customerListCacheKey(inventoryID uuid.UUID) string {
	return "customers:" + inventoryID.String()
}

const (
	TTL = 30 * 24 * time.Hour
)

func (r *Repository) ListCustomers(inventoryID uuid.UUID) ([]models.Customer, error) {
	key := customerListCacheKey(inventoryID)

	var cachedCustomers []models.Customer
	if err := r.cache.Get(key, &cachedCustomers); err == nil {
		return cachedCustomers, nil
	}

	query := `SELECT * FROM customers WHERE inventory_id = $1 ORDER BY created_at DESC`
	customers := []models.Customer{}

	err := r.db.Select(&customers, query, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching customers")
	}

	if err := r.cache.Set(key, customers, TTL); err != nil {
		return customers, errors.CacheError(err, "Error caching customers")
	}

	return customers, nil
}

func (r *Repository) GetCustomer(customerID uuid.UUID) (models.Customer, error) {
	key := customerCacheKey(customerID)

	var cachedCustomer models.Customer
	if err := r.cache.Get(key, &cachedCustomer); err == nil {
		return cachedCustomer, nil
	}

	var customer models.Customer
	query := `SELECT * FROM customers WHERE id = $1`

	err := r.db.Get(&customer, query, customerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return customer, errors.NotFoundError("Customer not found")
		}
		return customer, errors.DatabaseError(err, "Error getting customer by ID")
	}

	if err := r.cache.Set(key, customer, TTL); err != nil {
		return customer, errors.CacheError(err, "Error caching customer")
	}

	return customer, nil
}

func (r *Repository) CreateCustomer(customer *models.Customer) error {
	query := `
		INSERT INTO customers (
			id, name, email, phone, address, 
			customer_type, inventory_id, 
			created_at, updated_at
		) VALUES (
			:id, :name, :email, :phone, :address,
			:customer_type, :inventory_id,
			:created_at, :updated_at
		)
	`
	_, err := r.db.NamedExec(query, customer)
	if err != nil {
		return errors.DatabaseError(err, "Error creating customer")
	}

	r.invalidateCustomerCaches(customer.ID, customer.InventoryID)

	return nil
}

func (r *Repository) UpdateCustomer(customer *models.Customer) error {
	query := `
		UPDATE customers SET 
			name = :name,
			email = :email,
			phone = :phone,
			address = :address,
			customer_type = :customer_type,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.NamedExec(query, customer)
	if err != nil {
		return errors.DatabaseError(err, "Error updating customer")
	}

	r.invalidateCustomerCaches(customer.ID, customer.InventoryID)

	return nil
}

func (r *Repository) DeleteCustomer(customerID, inventoryID uuid.UUID) error {
	query := `DELETE FROM customers WHERE id = $1`
	_, err := r.db.Exec(query, customerID)
	if err != nil {
		return errors.DatabaseError(err, "Error deleting customer")
	}

	r.invalidateCustomerCaches(customerID, inventoryID)

	return nil
}

func (r *Repository) invalidateCustomerCaches(customerID, inventoryID uuid.UUID) {
	r.cache.Delete(customerCacheKey(customerID))
	r.cache.Delete(customerListCacheKey(inventoryID))
}
