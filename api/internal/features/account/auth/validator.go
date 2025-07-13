package auth

import (
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"
	"github.com/jmoiron/sqlx"
)

type AuthValidator struct {
	db *sqlx.DB
}

func NewValidator(db *sqlx.DB) *AuthValidator {
	return &AuthValidator{db: db}
}

func (v *AuthValidator) ValidateRegister(req *models.RegisterRequest) error {
	var errorMessages []string

	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Check username uniqueness
	usernameExists, err := v.usernameExists(req.Username)
	if err != nil {
		return errors.DatabaseError(err, "Error validating username")
	}
	if usernameExists {
		errorMessages = append(errorMessages, "Username already exists")
	}

	// Check email uniqueness
	emailExists, err := v.emailExists(req.Email)
	if err != nil {
		return errors.DatabaseError(err, "Error validating email")
	}
	if emailExists {
		errorMessages = append(errorMessages, "Email already exists")
	}

	// Check password length
	if len(req.Password) < 8 {
		errorMessages = append(errorMessages, "Password must be at least 8 characters long")
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *AuthValidator) ValidateLogin(req *models.LoginRequest) error {
	var errorMessages []string

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Email == "" {
		errorMessages = append(errorMessages, "Email is required")
	}
	if req.Password == "" {
		errorMessages = append(errorMessages, "Password is required")
	}

	if len(errorMessages) > 0 {
		return errors.ValidationError(strings.Join(errorMessages, "; "))
	}

	return nil
}

func (v *AuthValidator) usernameExists(username string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`

	err := v.db.Get(&exists, query, username)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (v *AuthValidator) emailExists(email string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`

	err := v.db.Get(&exists, query, email)
	if err != nil {
		return false, err
	}

	return exists, nil
}
