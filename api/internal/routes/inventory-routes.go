package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/inventories"
	"github.com/labstack/echo/v4"
)

func InventoryRoutes(e *echo.Echo, controller inventories.IInventoriesController, service auth.IAuthService) {
	api := e.Group("/api/inventories")

	api.Use(auth.AuthMiddleware(service))
	api.Use(auth.CSRFMiddleware(service))

	api.GET("", controller.ListInventories)
	api.GET("/:id", controller.GetInventory)
	api.POST("", controller.CreateInventory)
	api.PUT("/:id", controller.UpdateInventory)
	api.DELETE("/:id", controller.DeleteInventory)
}
