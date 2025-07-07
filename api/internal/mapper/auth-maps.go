package mapper

import (
	"strings"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
)

func SanitizeRegisterRequest(req *models.RegisterRequest) {
	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Password = strings.TrimSpace(req.Password)
}

func SanitizeLoginRequest(req *models.LoginRequest) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Password = strings.TrimSpace(req.Password)
}

func ToCreateUser(req *models.RegisterRequest, hashedPassword string) *models.User {
	return &models.User{
		ID:        uuid.New(),
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func ToAuthResponse(user *models.User, token, csrfToken string, inventories []models.Inventory) *models.AuthResponse {
	return &models.AuthResponse{
		UserID:      user.ID,
		Username:    user.Username,
		Email:       user.Email,
		Role:        user.Role,
		Avatar:      user.Avatar,
		Inventories: inventories,
		Token:       token,
		CSRFToken:   csrfToken,
	}
}
