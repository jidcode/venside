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
	r := api.Group("")

	r.GET("", controller.ListInventories)
	r.GET("/:id", controller.GetInventory)

	// Auth & CSRF protected routes (write operations)
	w := api.Group("")
	w.Use(auth.CSRFMiddleware(service))

	w.POST("", controller.CreateInventory)
	w.PUT("/:id", controller.UpdateInventory)
	w.DELETE("/:id", controller.DeleteInventory)
}
