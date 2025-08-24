package statistics

import (
	"net/http"
	"strconv"

	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Controller struct {
	repo StatsRepository
}

func NewController(repo StatsRepository) StatsController {
	return &Controller{repo: repo}
}

func (c *Controller) GetInventoryStats(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	timeRange, err := c.getValidatedTimeRange(ctx)
	if err != nil {
		return err
	}

	stats, err := c.repo.GetInventoryStats(inventoryID, timeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch inventory statistics", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   timeRange,
			"details":      err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, stats)
}

func (c *Controller) GetStockTrend(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	timeRange, err := c.getValidatedTimeRange(ctx)
	if err != nil {
		return err
	}

	stockData, err := c.repo.GetStockTrend(inventoryID, timeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch stock trend data", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   timeRange,
			"details":      err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, stockData)
}

func (c *Controller) GetSalesTrend(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	timeRange, err := c.getValidatedTimeRange(ctx)
	if err != nil {
		return err
	}

	salesData, err := c.repo.GetSalesTrend(inventoryID, timeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch sales trend data", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   timeRange,
			"details":      err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, salesData)
}

func (c *Controller) GetBestSellingProducts(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	timeRange, err := c.getValidatedTimeRange(ctx)
	if err != nil {
		return err
	}

	limit, err := c.getValidatedLimit(ctx)
	if err != nil {
		return err
	}

	products, err := c.repo.GetBestSellingProducts(inventoryID, timeRange, limit)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch best selling products", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   timeRange,
			"limit":        limit,
			"details":      err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, products)
}

func (c *Controller) GetRecentSales(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	limit, err := c.getValidatedLimit(ctx)
	if err != nil {
		return err
	}

	sales, err := c.repo.GetRecentSales(inventoryID, limit)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch recent sales", err, logrus.Fields{
			"inventory_id": inventoryID,
			"limit":        limit,
			"details":      err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, sales)
}

// HELPER METHODS

func (c *Controller) getValidatedTimeRange(ctx echo.Context) (string, error) {
	timeRange := ctx.QueryParam("timeRange")
	if timeRange == "" {
		timeRange = "1M"
	}

	// Validate time range
	validTimeRanges := map[string]bool{"1W": true, "1M": true, "3M": true, "6M": true, "1Y": true, "5Y": true, "MAX": true}
	if !validTimeRanges[timeRange] {
		return "", errors.ValidationError("Invalid time range. Must be one of: 1W, 1M, 3M, 6M, 1Y, 5Y, MAX")
	}

	return timeRange, nil
}

func (c *Controller) getValidatedLimit(ctx echo.Context) (int, error) {
	limitStr := ctx.QueryParam("limit")
	limit := 10
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			return 0, errors.ValidationError("Limit must be a positive integer")
		}
		if limit > 100 {
			limit = 100 // Cap at 100
		}
	}

	return limit, nil
}
