package server

import (
	"github.com/app/venside/config"
	"github.com/app/venside/internal/shared/utils"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/logger"

	"github.com/go-playground/validator/v10"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewServer(db *sqlx.DB, cache cache.IRedisCache, config *config.Variables) *echo.Echo {
	e := echo.New()

	e.Validator = &utils.AppValidator{Validator: validator.New()}

	// Security middleware
	e.Use(middleware.Secure())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())

	// Logging middleware
	e.Use(logger.HTTPErrorsMiddleware())
	e.Use(logger.RequestLoggerMiddleware())

	// CORS configuration
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", config.Domain},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PATCH, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
		MaxAge:           86400,
	}))

	ConfigureRoutes(e, db, cache, config)

	return e
}
