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
			"details":      err.Error(),
		})
	}

	response := make([]models.WarehouseResponse, len(warehouses))
	for i, warehouse := range warehouses {
		response[i] = *mapper.ToWarehouseResponse(&warehouse)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	warehouse, err := c.repo.GetWarehouseWithStock(warehouseID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
			"details":      err.Error(),
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
			"details":        err.Error(),
		})
	}

	response := mapper.ToWarehouseResponse(newWarehouse)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
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
			"details":      err.Error(),
		})
	}

	updatedWarehouse := mapper.ToUpdateWarehouse(&req, &existingWarehouse)
	if err := c.validator.ValidateWarehouse(updatedWarehouse); err != nil {
		return err
	}

	if err := c.repo.UpdateWarehouse(updatedWarehouse); err != nil {
		return logger.Error(ctx, "Failed to update warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
			"details":      err.Error(),
		})
	}

	response := mapper.ToWarehouseResponse(updatedWarehouse)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteWarehouse(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	if err := c.repo.DeleteWarehouse(warehouseID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete warehouse", err, logrus.Fields{
			"warehouse_id": warehouseID,
			"details":      err.Error(),
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) AddProductsToWarehouse(ctx echo.Context) error {
	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req struct {
		StockItems []models.StockItemRequest `json:"stockItems"`
	}

	if err := ctx.Bind(&req); err != nil {
		return errors.ValidationError("Invalid request payload")
	}

	// if err := c.validator.ValidateStockItems(req.StockItems, warehouseID); err != nil {
	// 	return err
	// }

	if err := c.repo.AddProductsToWarehouse(warehouseID, inventoryID, req.StockItems); err != nil {
		return logger.Error(ctx, "Failed to add products to warehouse", err, logrus.Fields{
			"details":      err.Error(),
			"warehouse_id": warehouseID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) RemoveProductFromWarehouse(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	if err := c.repo.RemoveProductFromWarehouse(inventoryID, warehouseID, productID); err != nil {
		return logger.Error(ctx, "Failed to remove product from warehouse", err, logrus.Fields{
			"details":      err.Error(),
			"warehouse_id": warehouseID,
			"product_id":   productID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) TransferWarehouseStock(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req struct {
		FromWarehouseID uuid.UUID                    `json:"fromWarehouseId"`
		ToWarehouseID   uuid.UUID                    `json:"toWarehouseId"`
		TransferItems   []models.TransferItemRequest `json:"transferItems"`
	}

	if err := ctx.Bind(&req); err != nil {
		return errors.ValidationError("Invalid request payload")
	}

	// Basic validation
	if req.FromWarehouseID == req.ToWarehouseID {
		return errors.ValidationError("Source and destination warehouses cannot be the same")
	}

	if len(req.TransferItems) == 0 {
		return errors.ValidationError("At least one product must be specified for transfer")
	}

	if err := c.repo.TransferWarehouseStock(inventoryID, req.FromWarehouseID, req.ToWarehouseID, req.TransferItems); err != nil {
		return logger.Error(ctx, "Failed to transfer products between warehouses", err, logrus.Fields{
			"details":           err.Error(),
			"from_warehouse_id": req.FromWarehouseID,
			"to_warehouse_id":   req.ToWarehouseID,
			"inventory_id":      inventoryID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}

func (c *Controller) UpdateStockQuantity(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	warehouseID, err := uuid.Parse(ctx.Param("warehouseId"))
	if err != nil {
		return errors.ValidationError("Invalid warehouse ID")
	}

	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		return errors.ValidationError("Invalid product ID")
	}

	var req struct {
		NewQuantity int `json:"newQuantity" validate:"min=0"`
	}

	if err := ctx.Bind(&req); err != nil {
		return errors.ValidationError("Invalid request payload")
	}

	if err := c.repo.UpdateStockQuantity(inventoryID, warehouseID, productID, req.NewQuantity); err != nil {
		return logger.Error(ctx, "Failed to update product stock quantity", err, logrus.Fields{
			"details":      err.Error(),
			"warehouse_id": warehouseID,
			"product_id":   productID,
			"new_quantity": req.NewQuantity,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
