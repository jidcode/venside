package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/warehouses"
	"github.com/labstack/echo/v4"
)

func WarehouseRoutes(e *echo.Echo, controller warehouses.WarehouseController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId/warehouses")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	r := api.Group("")

	r.GET("", controller.ListWarehouses)
	r.GET("/:id", controller.GetWarehouse)

	// Auth & CSRF protected routes (write operations)
	w := api.Group("")
	w.Use(auth.CSRFMiddleware(service))

	w.POST("", controller.CreateWarehouse)
	w.PUT("/:id", controller.UpdateWarehouse)
	w.DELETE("/:id", controller.DeleteWarehouse)

}
