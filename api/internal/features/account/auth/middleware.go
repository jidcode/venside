package auth

import (
	"strings"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/errors"

	"github.com/labstack/echo/v4"
)

func AuthMiddleware(service IAuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			authHeader := ctx.Request().Header.Get("Authorization")
			if authHeader == "" {
				return errors.UnauthorizedError("Missing authorization header")
			}

			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				return errors.UnauthorizedError("Invalid authorization header format")
			}

			user, err := service.GetUserFromToken(tokenParts[1])
			if err != nil {
				return err
			}

			ctx.Set("user", user)
			return next(ctx)
		}
	}
}

func CSRFMiddleware(service IAuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			// Only check CSRF for state-changing operations
			if ctx.Request().Method == "POST" || ctx.Request().Method == "PUT" || ctx.Request().Method == "DELETE" {
				csrfToken := ctx.Request().Header.Get("X-CSRF-Token")
				if csrfToken == "" {
					return errors.UnauthorizedError("CSRF token required")
				}

				if !service.ValidateCSRFToken(csrfToken) {
					return errors.UnauthorizedError("Invalid CSRF token")
				}
			}

			return next(ctx)
		}
	}
}

func RoleMiddleware(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			user, ok := ctx.Get("user").(*models.User)
			if !ok {
				return errors.UnauthorizedError("User not found in context")
			}

			for _, role := range roles {
				if user.Role == role {
					return next(ctx)
				}
			}

			return errors.ForbiddenError("Insufficient permissions")
		}
	}
}
