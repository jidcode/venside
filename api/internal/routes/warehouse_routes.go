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
	readOnly := api.Group("")
	readOnly.GET("", controller.ListWarehouses)
	readOnly.GET("/:id", controller.GetWarehouse)

	// Auth & CSRF protected routes (write operations)
	whGroup := api.Group("")
	whGroup.Use(auth.CSRFMiddleware(service))
	whGroup.POST("", controller.CreateWarehouse)
	whGroup.PUT("/:id", controller.UpdateWarehouse)
	whGroup.DELETE("/:id", controller.DeleteWarehouse)

	whGroup.POST("/:id/products", controller.AddProductsToWarehouse)
	whGroup.DELETE("/:id/products", controller.RemoveProductsFromWarehouse)
	whGroup.PUT("/:id/stock", controller.UpdateStockQuantity)
	whGroup.POST("/transfer", controller.TransferProducts)

}
