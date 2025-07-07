package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `db:"id" json:"id"`
	Username  string    `db:"username" json:"username"`
	Email     string    `db:"email" json:"email"`
	Password  string    `db:"password" json:"-"`
	Role      string    `db:"role" json:"role"`
	Avatar    *string   `db:"avatar" json:"avatar"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}

// Request DTOs
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=255"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// Response DTOs
type AuthResponse struct {
	UserID      uuid.UUID   `json:"userId"`
	Username    string      `json:"username"`
	Email       string      `json:"email"`
	Role        string      `json:"role"`
	Avatar      *string     `json:"avatar"`
	Inventories []Inventory `json:"inventories"`

	Token     string `json:"token"`
	CSRFToken string `json:"csrfToken"`
}

type CSRFTokenResponse struct {
	CSRFToken string `json:"csrfToken"`
}
