// Sales Router
package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/sales"
	"github.com/labstack/echo/v4"
)

func SaleRoutes(e *echo.Echo, controller sales.SaleController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("/sales", controller.ListSales)
	readOnly.GET("/sales/:saleId", controller.GetSale)

	// Auth & CSRF protected routes (write operations)
	salesGroup := api.Group("/sales")
	salesGroup.Use(auth.CSRFMiddleware(service))
	salesGroup.POST("", controller.CreateSale)
	salesGroup.DELETE("/:saleId", controller.DeleteSale)
}
