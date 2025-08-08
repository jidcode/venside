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
	readOnly.GET("/:warehouseId", controller.GetWarehouse)

	// Auth & CSRF protected routes (write operations)
	whGroup := api.Group("")
	whGroup.Use(auth.CSRFMiddleware(service))
	whGroup.POST("", controller.CreateWarehouse)
	whGroup.PUT("/:warehouseId", controller.UpdateWarehouse)
	whGroup.DELETE("/:warehouseId", controller.DeleteWarehouse)

	whGroup.POST("/:warehouseId/products", controller.AddProductsToWarehouse)
	whGroup.POST("/transfer", controller.TransferWarehouseStock)
	whGroup.PUT("/:warehouseId/products/:productId/stock", controller.UpdateStockQuantity)
	whGroup.DELETE("/:warehouseId/products/:productId", controller.RemoveProductFromWarehouse)

}
