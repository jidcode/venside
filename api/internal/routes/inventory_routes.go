package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/inventories"
	"github.com/labstack/echo/v4"
)

func InventoryRoutes(e *echo.Echo, controller inventories.InventoryController, service auth.AuthService) {
	api := e.Group("/api/inventories")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("", controller.ListInventories)
	readOnly.GET("/:id", controller.GetInventory)

	// Auth & CSRF protected routes (write operations)
	invGroup := api.Group("")
	invGroup.Use(auth.CSRFMiddleware(service))
	invGroup.POST("", controller.CreateInventory)
	invGroup.PUT("/:id", controller.UpdateInventory)
	invGroup.DELETE("/:id", controller.DeleteInventory)
}
