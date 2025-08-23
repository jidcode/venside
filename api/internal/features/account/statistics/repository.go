package statistics

import (
	"database/sql"
	"time"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/pkg/cache"
	"github.com/app/venside/pkg/errors"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db    *sqlx.DB
	cache cache.RedisService
}

func NewRepository(db *sqlx.DB, cache cache.RedisService) StatsRepository {
	return &Repository{db: db, cache: cache}
}

// func statsCacheKey(inventoryID uuid.UUID, timeRange string) string {
// 	return "stats:" + inventoryID.String() + ":" + timeRange
// }

const StatsTTL = 60 * time.Minute

func (r *Repository) getDateRange(timeRange string) (time.Time, time.Time) {
	now := time.Now()
	endDate := now
	var startDate time.Time

	switch timeRange {
	case "1W":
		startDate = now.AddDate(0, 0, -7)
	case "1M":
		startDate = now.AddDate(0, -1, 0)
	case "3M":
		startDate = now.AddDate(0, -3, 0)
	case "6M":
		startDate = now.AddDate(0, -6, 0)
	case "1Y":
		startDate = now.AddDate(-1, 0, 0)
	case "5Y":
		startDate = now.AddDate(-5, 0, 0)
	case "MAX":
		startDate = now.AddDate(-10, 0, 0)
	default:
		startDate = now.AddDate(-1, 0, 0) // Default to 1 year
	}

	return startDate, endDate
}

func (r *Repository) GetInventoryStats(inventoryID uuid.UUID, timeRange string) (*models.InventoryStats, error) {
	// key := statsCacheKey(inventoryID, timeRange)
	// var cachedStats models.InventoryStats
	// if err := r.cache.Get(key, &cachedStats); err == nil {
	// 	return &cachedStats, nil
	// }

	startDate, endDate := r.getDateRange(timeRange)
	var stats models.InventoryStats
	stats.StartDate = startDate
	stats.EndDate = endDate

	// 1. Get total stock quantity
	totalStockQuery := `
		SELECT COALESCE(SUM(p.total_quantity), 0) as total_quantity
		FROM products p
		WHERE p.inventory_id = $1
	`
	err := r.db.Get(&stats.TotalStockQuantity, totalStockQuery, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching total stock quantity")
	}

	// 2. Get total inventory value
	totalValueQuery := `
		SELECT COALESCE(SUM(p.cost_price * p.total_quantity), 0) as total_value
		FROM products p
		WHERE p.inventory_id = $1
	`
	err = r.db.Get(&stats.TotalInventoryValue, totalValueQuery, inventoryID)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching total inventory value")
	}

	// 3. Get gross sales revenue
	grossSalesQuery := `
		SELECT COALESCE(SUM(s.total_amount + s.discount_amount), 0) as gross_sales
		FROM sales s
		WHERE s.inventory_id = $1 AND s.sale_date BETWEEN $2 AND $3
	`
	err = r.db.Get(&stats.GrossSalesRevenue, grossSalesQuery, inventoryID, startDate, endDate)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching gross sales revenue")
	}

	// 4. Get net profit (revenue - cost)
	netProfitQuery := `
		SELECT COALESCE(SUM(s.total_amount - (si.quantity * p.cost_price)), 0) as net_profit
		FROM sales s
		JOIN sale_items si ON s.id = si.sale_id
		JOIN products p ON si.product_id = p.id
		WHERE s.inventory_id = $1 AND s.sale_date BETWEEN $2 AND $3
	`
	err = r.db.Get(&stats.NetProfit, netProfitQuery, inventoryID, startDate, endDate)
	if err != nil && err != sql.ErrNoRows {
		return nil, errors.DatabaseError(err, "Error fetching net profit")
	}

	// if err := r.cache.Set(key, stats, StatsTTL); err != nil {
	// 	logger.Warn("Failed to cache inventory stats", logrus.Fields{
	// 		"cache_key":    key,
	// 		"inventory_id": inventoryID,
	// 		"error":        err.Error(),
	// 	})
	// }

	return &stats, nil
}

func (r *Repository) GetStockTrend(inventoryID uuid.UUID, timeRange string) (*models.StockDataResponse, error) {
	startDate, endDate := r.getDateRange(timeRange)

	query := `
		SELECT 
			TO_CHAR(date_trunc('month', created_at), 'Mon YYYY') as month,
			SUM(total_quantity) as quantity
		FROM products 
		WHERE inventory_id = $1 AND created_at BETWEEN $2 AND $3
		GROUP BY date_trunc('month', created_at)
		ORDER BY date_trunc('month', created_at)
	`

	var stockData []models.StockData
	err := r.db.Select(&stockData, query, inventoryID, startDate, endDate)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching stock trend data")
	}

	response := &models.StockDataResponse{
		StartDate: startDate,
		EndDate:   endDate,
		StockData: stockData,
	}

	return response, nil
}

func (r *Repository) GetSalesTrend(inventoryID uuid.UUID, timeRange string) (*models.SalesDataResponse, error) {
	startDate, endDate := r.getDateRange(timeRange)

	query := `
		SELECT 
			TO_CHAR(date_trunc('month', s.sale_date), 'Mon YYYY') as month,
			SUM(s.total_amount) as revenue,
			SUM(s.total_amount - (si.quantity * p.cost_price)) as profit
		FROM sales s
		JOIN sale_items si ON s.id = si.sale_id
		JOIN products p ON si.product_id = p.id
		WHERE s.inventory_id = $1 AND s.sale_date BETWEEN $2 AND $3
		GROUP BY date_trunc('month', s.sale_date)
		ORDER BY date_trunc('month', s.sale_date)
	`

	var salesData []models.SalesData
	err := r.db.Select(&salesData, query, inventoryID, startDate, endDate)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching sales trend data")
	}

	response := &models.SalesDataResponse{
		StartDate: startDate,
		EndDate:   endDate,
		SalesData: salesData,
	}

	return response, nil
}

func (r *Repository) GetBestSellingProducts(inventoryID uuid.UUID, timeRange string, limit int) (*models.BestSellersResponse, error) {
	startDate, endDate := r.getDateRange(timeRange)

	query := `
		SELECT 
			p.id as product_id,
			p.name as product_name,
			COALESCE(SUM(si.quantity), 0) as total_sold,
			COALESCE(SUM(si.quantity * si.unit_price), 0) as revenue,
			COALESCE(pi.url, '') as image_url
		FROM products p
		LEFT JOIN sale_items si ON p.id = si.product_id
		LEFT JOIN sales s ON si.sale_id = s.id AND s.sale_date BETWEEN $2 AND $3
		LEFT JOIN (
			SELECT product_id, url 
			FROM product_images 
			WHERE is_primary = true
		) pi ON p.id = pi.product_id
		WHERE p.inventory_id = $1
		GROUP BY p.id, p.name, pi.url
		ORDER BY total_sold DESC, revenue DESC
		LIMIT $4
	`

	var bestSellers []models.BestSellingProduct
	err := r.db.Select(&bestSellers, query, inventoryID, startDate, endDate, limit)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching best selling products")
	}

	response := &models.BestSellersResponse{
		StartDate:   startDate,
		EndDate:     endDate,
		BestSellers: bestSellers,
	}

	return response, nil
}

func (r *Repository) GetRecentSales(inventoryID uuid.UUID, limit int) ([]models.RecentSale, error) {
	query := `
		SELECT 
			s.id as sale_id,
			s.sale_number,
			COALESCE(s.customer_name, c.name) as customer_name,
			s.total_amount,
			s.payment_status,
			s.sale_date
		FROM sales s
		LEFT JOIN customers c ON s.customer_id = c.id
		WHERE s.inventory_id = $1
		ORDER BY s.sale_date DESC, s.created_at DESC
		LIMIT $2
	`

	var recentSales []models.RecentSale
	err := r.db.Select(&recentSales, query, inventoryID, limit)
	if err != nil {
		return nil, errors.DatabaseError(err, "Error fetching recent sales")
	}

	return recentSales, nil
}
