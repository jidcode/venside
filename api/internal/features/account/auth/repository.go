package auth

import (
	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AuthRepository interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (models.User, error)
	GetUserByID(id uuid.UUID) (models.User, error)
	GetUserInventories(userID uuid.UUID) ([]models.Inventory, error)
}

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) AuthRepository {
	return &Repository{db: db}
}

func (r *Repository) CreateUser(user *models.User) error {
	query := `INSERT INTO users (id, username, email, password, role, avatar, created_at, updated_at)
              VALUES (:id, :username, :email, :password, :role, :avatar, :created_at, :updated_at)`

	_, err := r.db.NamedExec(query, user)
	if err != nil {
		return errors.DatabaseError(err, "Create User")
	}

	return nil
}

func (r *Repository) GetUserByEmail(email string) (models.User, error) {
	var user models.User
	query := `SELECT * FROM users WHERE email = $1`

	err := r.db.Get(&user, query, email)
	if err != nil {
		return user, errors.DatabaseError(err, "Get User By Email")
	}

	return user, nil
}

func (r *Repository) GetUserByID(id uuid.UUID) (models.User, error) {
	var user models.User
	query := `SELECT * FROM users WHERE id = $1`

	err := r.db.Get(&user, query, id)
	if err != nil {
		return user, errors.DatabaseError(err, "Get User By ID")
	}

	return user, nil
}

func (r *Repository) GetUserInventories(userID uuid.UUID) ([]models.Inventory, error) {
	var inventories []models.Inventory
	query := `SELECT * FROM inventories WHERE user_id = $1`

	err := r.db.Select(&inventories, query, userID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Get User Inventories")
	}

	return inventories, nil
}
