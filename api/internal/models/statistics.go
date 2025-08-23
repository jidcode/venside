package models

import (
	"time"

	"github.com/google/uuid"
)

type TimeRange struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

var (
	OneWeek     = TimeRange{Value: "1W", Label: "1 Week"}
	OneMonth    = TimeRange{Value: "1M", Label: "1 Month"}
	ThreeMonths = TimeRange{Value: "3M", Label: "3 Months"}
	SixMonths   = TimeRange{Value: "6M", Label: "6 Months"}
	OneYear     = TimeRange{Value: "1Y", Label: "1 Year"}
	FiveYears   = TimeRange{Value: "5Y", Label: "5 Years"}
	Max         = TimeRange{Value: "MAX", Label: "10 Years"}
)

type InventoryStats struct {
	TotalStockQuantity  int       `json:"totalStockQuantity"`
	TotalInventoryValue int       `json:"totalInventoryValue"`
	GrossSalesRevenue   int       `json:"grossSalesRevenue"`
	NetProfit           int       `json:"netProfit"`
	StartDate           time.Time `json:"startDate"`
	EndDate             time.Time `json:"endDate"`
}

type StockData struct {
	Month    string `json:"month" db:"month"`
	Quantity int    `json:"quantity" db:"quantity"`
}

type SalesData struct {
	Month   string `json:"month" db:"month"`
	Revenue int    `json:"revenue" db:"revenue"`
	Profit  int    `json:"profit" db:"profit"`
}

type BestSellingProduct struct {
	ProductID   uuid.UUID `json:"productId" db:"product_id"`
	ProductName string    `json:"productName" db:"product_name"`
	TotalSold   int       `json:"totalSold" db:"total_sold"`
	Revenue     int       `json:"revenue" db:"revenue"`
	ImageURL    string    `json:"imageUrl" db:"image_url"`
}

type RecentSale struct {
	SaleID        uuid.UUID `json:"saleId" db:"sale_id"`
	SaleNumber    string    `json:"saleNumber" db:"sale_number"`
	CustomerName  string    `json:"customerName" db:"customer_name"`
	TotalAmount   int       `json:"totalAmount" db:"total_amount"`
	PaymentStatus string    `json:"paymentStatus" db:"payment_status"`
	SaleDate      time.Time `json:"saleDate" db:"sale_date"`
}

// DTOs

type StatsRequest struct {
	TimeRange string `json:"timeRange" validate:"required,oneof=1W 1M 3M 6M 1Y 5Y MAX"`
}

type StockDataResponse struct {
	StartDate time.Time   `json:"startDate"`
	EndDate   time.Time   `json:"endDate"`
	StockData []StockData `json:"stockData"`
}

type SalesDataResponse struct {
	StartDate time.Time   `json:"startDate"`
	EndDate   time.Time   `json:"endDate"`
	SalesData []SalesData `json:"salesData"`
}

type BestSellersResponse struct {
	StartDate   time.Time            `json:"startDate"`
	EndDate     time.Time            `json:"endDate"`
	BestSellers []BestSellingProduct `json:"bestSellers"`
}
