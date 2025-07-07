package inventories

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
	repo      IInventoryRepository
	validator *InventoryValidator
}

func NewController(repo IInventoryRepository, validator *InventoryValidator) IInventoriesController {
	return &Controller{
		repo:      repo,
		validator: validator,
	}
}

func (c *Controller) ListInventories(ctx echo.Context) error {
	user, ok := ctx.Get("user").(*models.User)
	if !ok {
		return errors.New(errors.Unauthorized, "User not authenticated", http.StatusUnauthorized)
	}

	inventories, err := c.repo.ListInventories(user.ID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch user inventories", err, logrus.Fields{
			"user_id": user.ID,
		})
	}

	response := make([]models.InventoryResponse, len(inventories))
	for i, inventory := range inventories {
		response[i] = *mapper.ToInventoryResponse(&inventory)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetInventory(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	inventory, err := c.repo.GetInventory(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve account", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := mapper.ToInventoryResponse(&inventory)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateInventory(ctx echo.Context) error {
	user, ok := ctx.Get("user").(*models.User)
	if !ok {
		return errors.New(errors.Unauthorized, "User not authenticated", http.StatusUnauthorized)
	}

	var req models.InventoryRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	mapper.SanitizeInventoryRequest(&req)

	newInventory := mapper.ToCreateInventory(&req, user.ID)
	if err := c.validator.ValidateInventory(newInventory); err != nil {
		return err
	}

	if err := c.repo.CreateInventory(newInventory); err != nil {
		return logger.Error(ctx, "Failed to create inventory", err, logrus.Fields{
			"inventory_name": newInventory.Name,
		})
	}

	response := mapper.ToInventoryResponse(newInventory)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateInventory(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.InventoryRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	mapper.SanitizeInventoryRequest(&req)

	existingInventory, err := c.repo.GetInventory(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Inventory not found", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	updatedInventory := mapper.ToEditInventory(&req, &existingInventory)
	if err := c.validator.ValidateInventory(updatedInventory); err != nil {
		return err
	}

	if err := c.repo.UpdateInventory(updatedInventory); err != nil {
		return logger.Error(ctx, "Failed to update inventory", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := mapper.ToInventoryResponse(updatedInventory)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteInventory(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	err = c.repo.DeleteInventory(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to delete inventory", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
