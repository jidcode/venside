package statistics

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type StatsRepository interface {
	GetInventoryStats(inventoryID uuid.UUID, timeRange string) (*models.InventoryStats, error)
	GetStockTrend(inventoryID uuid.UUID, timeRange string) (*models.StockDataResponse, error)
	GetSalesTrend(inventoryID uuid.UUID, timeRange string) (*models.SalesDataResponse, error)
	GetBestSellingProducts(inventoryID uuid.UUID, timeRange string, limit int) (*models.BestSellersResponse, error)
	GetRecentSales(inventoryID uuid.UUID, limit int) ([]models.RecentSale, error)
}

type StatsController interface {
	GetInventoryStats(ctx echo.Context) error
	GetStockTrend(ctx echo.Context) error
	GetSalesTrend(ctx echo.Context) error
	GetBestSellingProducts(ctx echo.Context) error
	GetRecentSales(ctx echo.Context) error
}
