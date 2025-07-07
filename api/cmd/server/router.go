package server

import (
	"github.com/app/venside/config"
	"github.com/app/venside/pkg/cache"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

func ConfigureRoutes(e *echo.Echo, db *sqlx.DB, cache cache.IRedisCache, config *config.Variables) {

	// Health check endpoint
	e.GET("/health", func(ctx echo.Context) error {
		return ctx.JSON(200, map[string]string{"status": "A-OK!"})
	})
}
