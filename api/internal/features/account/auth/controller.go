package auth

import (
	"net/http"
	"strings"
	"time"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/internal/shared/utils"
	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/golang-jwt/jwt"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Controller struct {
	service   AuthService
	validator *AuthValidator
}

type AuthController interface {
	Register(ctx echo.Context) error
	Login(ctx echo.Context) error
	GetUserProfile(ctx echo.Context) error
	GetCSRFToken(ctx echo.Context) error
	CheckTokenExpiration(ctx echo.Context) error
}

func NewController(service AuthService, validator *AuthValidator) AuthController {
	return &Controller{
		service:   service,
		validator: validator,
	}
}

func (c *Controller) Register(ctx echo.Context) error {
	var req models.RegisterRequest
	mapper.SanitizeRegisterRequest(&req)

	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	if err := c.validator.ValidateRegister(&req); err != nil {
		return err
	}

	user, err := c.service.RegisterUser(&req)
	if err != nil {
		return logger.Error(ctx, "Registration failed", err, logrus.Fields{
			"email":    req.Email,
			"username": req.Username,
		})
	}

	return ctx.JSON(http.StatusCreated, user)
}

func (c *Controller) Login(ctx echo.Context) error {
	var req models.LoginRequest
	mapper.SanitizeLoginRequest(&req)

	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	// CSRF token validation for login
	csrfToken := ctx.Request().Header.Get("X-CSRF-Token")
	if csrfToken == "" {
		return errors.UnauthorizedError("CSRF token required")
	}

	if !c.service.ValidateCSRFToken(csrfToken) {
		return errors.UnauthorizedError("Invalid CSRF token")
	}

	if err := c.validator.ValidateLogin(&req); err != nil {
		return err
	}

	response, err := c.service.LoginUser(&req)
	if err != nil {
		return logger.Error(ctx, "Login failed", err, logrus.Fields{
			"email": req.Email,
		})
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetUserProfile(ctx echo.Context) error {
	user := ctx.Get("user").(*models.User)
	return ctx.JSON(http.StatusOK, user)
}

func (c *Controller) GetCSRFToken(ctx echo.Context) error {
	token := c.service.GenerateCSRFToken()
	return ctx.JSON(http.StatusOK, models.CSRFTokenResponse{CSRFToken: token})
}

func (c *Controller) CheckTokenExpiration(ctx echo.Context) error {
	// Extract token from header
	authHeader := ctx.Request().Header.Get("Authorization")
	if authHeader == "" {
		return errors.ValidationError("No token provided")
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Validate token and check expiration
	token, err := c.service.ValidateToken(tokenString)
	if err != nil {
		return ctx.JSON(http.StatusOK, map[string]bool{"expired": true})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return ctx.JSON(http.StatusOK, map[string]bool{"expired": true})
	}

	exp, ok := claims["exp"].(float64)
	if !ok {
		return ctx.JSON(http.StatusOK, map[string]bool{"expired": true})
	}

	isExpired := time.Now().Unix() > int64(exp)

	return ctx.JSON(http.StatusOK, map[string]bool{"expired": isExpired})
}
