package auth

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type IAuthService interface {
	RegisterUser(req *models.RegisterRequest) (*models.User, error)
	LoginUser(req *models.LoginRequest) (*models.AuthResponse, error)
	ValidateToken(tokenString string) (*jwt.Token, error)
	GetUserFromToken(tokenString string) (*models.User, error)
	GenerateCSRFToken() string
	ValidateCSRFToken(token string) bool
}

type Service struct {
	repo       IAuthRepository
	jwtSecret  string
	csrfTokens map[string]time.Time
	csrfMutex  sync.RWMutex
}

func NewService(repo IAuthRepository, jwtSecret string) IAuthService {
	service := &Service{
		repo:       repo,
		jwtSecret:  jwtSecret,
		csrfTokens: make(map[string]time.Time),
	}

	// Clean up expired CSRF tokens every 30 minutes
	go service.cleanupCSRFTokens()

	return service
}

func (s *Service) RegisterUser(req *models.RegisterRequest) (*models.User, error) {
	mapper.SanitizeRegisterRequest(req)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.InternalError(err, "Failed to hash password")
	}

	user := mapper.ToCreateUser(req, string(hashedPassword))

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) LoginUser(req *models.LoginRequest) (*models.AuthResponse, error) {
	mapper.SanitizeLoginRequest(req)

	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.UnauthorizedError("Invalid login credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.UnauthorizedError("Invalid login credentials")
	}

	token, err := s.generateJWT(&user)
	if err != nil {
		return nil, errors.InternalError(err, "Failed to generate token")
	}

	csrfToken := s.GenerateCSRFToken()

	inventories, err := s.repo.GetUserInventories(user.ID)
	if err != nil {
		return nil, err
	}

	return mapper.ToAuthResponse(&user, token, csrfToken, inventories), nil
}

func (s *Service) ValidateToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.UnauthorizedError("Invalid signing method")
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, errors.UnauthorizedError("Invalid token")
	}

	return token, nil
}

func (s *Service) GetUserFromToken(tokenString string) (*models.User, error) {
	token, err := s.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.UnauthorizedError("Invalid token")
	}

	userID, err := uuid.Parse(claims["user_id"].(string))
	if err != nil {
		return nil, errors.UnauthorizedError("Invalid user ID in token")
	}

	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Helper methods
func (s *Service) GenerateCSRFToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	token := hex.EncodeToString(bytes)

	s.csrfMutex.Lock()
	s.csrfTokens[token] = time.Now().Add(24 * time.Hour)
	s.csrfMutex.Unlock()

	return token
}

func (s *Service) ValidateCSRFToken(token string) bool {
	s.csrfMutex.RLock()
	expiry, exists := s.csrfTokens[token]
	s.csrfMutex.RUnlock()

	if !exists {
		return false
	}

	if time.Now().After(expiry) {
		s.csrfMutex.Lock()
		delete(s.csrfTokens, token)
		s.csrfMutex.Unlock()
		return false
	}

	return true
}

func (s *Service) generateJWT(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.String(),
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString([]byte(s.jwtSecret))
}

func (s *Service) cleanupCSRFTokens() {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.csrfMutex.Lock()
		now := time.Now()
		for token, expiry := range s.csrfTokens {
			if now.After(expiry) {
				delete(s.csrfTokens, token)
			}
		}
		s.csrfMutex.Unlock()
	}
}
