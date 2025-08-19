package sales

import (
	"net/http"

	"github.com/app/venside/internal/mapper"
	"github.com/app/venside/internal/models"
	"github.com/app/venside/internal/shared/utils"
	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type Controller struct {
	repo SaleRepository
}

func NewController(repo SaleRepository) SaleController {
	return &Controller{
		repo: repo,
	}
}

func (c *Controller) ListSales(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	sales, err := c.repo.ListSales(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch sales", err, logrus.Fields{
			"details":      err.Error(),
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.SaleResponse, len(sales))
	for i, sale := range sales {
		response[i] = *mapper.ToSaleResponse(&sale)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetSale(ctx echo.Context) error {
	saleID, err := uuid.Parse(ctx.Param("saleId"))
	if err != nil {
		return errors.ValidationError("Invalid sale ID")
	}

	sale, err := c.repo.GetSale(saleID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve sale", err, logrus.Fields{
			"details": err.Error(),
			"sale_id": saleID,
		})
	}

	response := mapper.ToSaleResponse(&sale)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateSale(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.SaleRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newSale := mapper.ToCreateSale(&req, inventoryID)

	if err := c.repo.CreateSale(newSale); err != nil {
		return logger.Error(ctx, "Failed to create sale", err, logrus.Fields{
			"details":       err.Error(),
			"customer_name": newSale.CustomerName,
		})
	}

	response := mapper.ToSaleResponse(newSale)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) DeleteSale(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	saleID, err := uuid.Parse(ctx.Param("saleId"))
	if err != nil {
		return errors.ValidationError("Invalid sale ID")
	}

	if err := c.repo.DeleteSale(saleID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete sale", err, logrus.Fields{
			"details": err.Error(),
			"sale_id": saleID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
