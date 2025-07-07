package server

import (
	"github.com/app/venside/config"
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/inventories"
	"github.com/app/venside/internal/routes"
	"github.com/app/venside/pkg/cache"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

func ConfigureRoutes(e *echo.Echo, db *sqlx.DB, cache cache.IRedisCache, config *config.Variables) {
	// Health check endpoint
	e.GET("/health", func(ctx echo.Context) error {
		return ctx.JSON(200, map[string]string{"status": "OK!"})
	})

	// Initialize auth routing components
	authRepo := auth.NewRepository(db)
	authValidator := auth.NewValidator(db)
	authService := auth.NewService(authRepo, config.JWTSecret)
	authController := auth.NewController(authService, authValidator)
	routes.AuthRoutes(e, authController, authService)

	// Inventory routes
	inventoryRepo := inventories.NewRepository(db)
	inventoryValidator := inventories.NewValidator(db)
	inventoryController := inventories.NewController(inventoryRepo, inventoryValidator)
	routes.InventoryRoutes(e, inventoryController, authService)
}
