package warehouses

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
	repo      WarehouseRepository
	validator *WarehouseValidator
}

func NewController(repo WarehouseRepository, validator *WarehouseValidator) WarehouseController {
	return &Controller{
		repo:      repo,
		validator: validator,
	}
}

func (c *Controller) ListWarehouses(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	warehouses, err := c.repo.ListWarehouses(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch warehouses", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.WarehouseResponse, len(warehouses))
	for i, warehouse := range warehouses {
		response[i] = *mapper.ToWarehouseResponse(&warehouse)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	warehouse, err := c.repo.GetWarehouseWithStock(warehouseID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
		})
	}

	response := mapper.ToWarehouseResponse(&warehouse)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateWarehouse(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.WarehouseRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newWarehouse := mapper.ToCreateWarehouse(&req, inventoryID)
	if err := c.validator.ValidateWarehouse(newWarehouse); err != nil {
		return err
	}

	if err := c.repo.CreateWarehouse(newWarehouse); err != nil {
		return logger.Error(ctx, "Failed to create warehouse", err, logrus.Fields{
			"warehouse_name": newWarehouse.Name,
		})
	}

	response := mapper.ToWarehouseResponse(newWarehouse)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	var req models.WarehouseRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	existingWarehouse, err := c.repo.GetWarehouse(warehouseID)
	if err != nil {
		return logger.Error(ctx, "Warehouse not found", err, logrus.Fields{
			"warehouse_id": warehouseID,
		})
	}

	updatedWarehouse := mapper.ToUpdateWarehouse(&req, &existingWarehouse)
	if err := c.validator.ValidateWarehouse(updatedWarehouse); err != nil {
		return err
	}

	if err := c.repo.UpdateWarehouse(updatedWarehouse); err != nil {
		return logger.Error(ctx, "Failed to update warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
		})
	}

	response := mapper.ToWarehouseResponse(updatedWarehouse)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	if err := c.repo.DeleteWarehouse(warehouseID); err != nil {
		return logger.Error(ctx, "Failed to delete warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
