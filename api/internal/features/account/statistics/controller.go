package statistics

import (
	"net/http"
	"strconv"

	"github.com/app/venside/internal/models"
	"github.com/app/venside/internal/shared/utils"
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

	var req models.StatsRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	stats, err := c.repo.GetInventoryStats(inventoryID, req.TimeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch inventory statistics", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   req.TimeRange,
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

	var req models.StatsRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	stockData, err := c.repo.GetStockTrend(inventoryID, req.TimeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch stock trend data", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   req.TimeRange,
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

	var req models.StatsRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	salesData, err := c.repo.GetSalesTrend(inventoryID, req.TimeRange)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch sales trend data", err, logrus.Fields{
			"inventory_id": inventoryID,
			"time_range":   req.TimeRange,
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

	// Get time range from query parameter (default to 1 month)
	timeRange := ctx.QueryParam("timeRange")
	if timeRange == "" {
		timeRange = "1M"
	}

	// Get limit from query parameter (default to 10)
	limitStr := ctx.QueryParam("limit")
	limit := 10
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			return errors.ValidationError("Limit must be a positive integer")
		}
		if limit > 100 {
			limit = 100 // Cap at 100 for safety
		}
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

	// Get limit from query parameter (default to 10)
	limitStr := ctx.QueryParam("limit")
	limit := 10
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			return errors.ValidationError("Limit must be a positive integer")
		}
		if limit > 100 {
			limit = 100 // Cap at 100 for safety
		}
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
