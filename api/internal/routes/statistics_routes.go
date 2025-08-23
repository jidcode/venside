package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/account/statistics"
	"github.com/labstack/echo/v4"
)

func StatisticsRoutes(e *echo.Echo, controller statistics.StatsController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId/statistics")

	// Auth protected routes
	api.Use(auth.AuthMiddleware(service))

	api.GET("", controller.GetInventoryStats)
	api.GET("/stock-trend", controller.GetStockTrend)
	api.GET("/sales-trend", controller.GetSalesTrend)
	api.GET("/best-sellers", controller.GetBestSellingProducts)
	api.GET("/recent-sales", controller.GetRecentSales)
}
