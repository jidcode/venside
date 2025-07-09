package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/inventories"
	"github.com/labstack/echo/v4"
)

func InventoryRoutes(e *echo.Echo, controller inventories.IInventoriesController, service auth.IAuthService) {
	api := e.Group("/api/inventories")

	// All inventory routes require authentication
	api.Use(auth.AuthMiddleware(service))

	// GET routes don't need CSRF protection
	readOnlyGroup := api.Group("")
	readOnlyGroup.GET("", controller.ListInventories)
	readOnlyGroup.GET("/:id", controller.GetInventory)

	// State-changing routes need CSRF protection
	protectedGroup := api.Group("")
	protectedGroup.Use(auth.CSRFMiddleware(service))
	protectedGroup.POST("", controller.CreateInventory)
	protectedGroup.PUT("/:id", controller.UpdateInventory)
	protectedGroup.DELETE("/:id", controller.DeleteInventory)
}
