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
	repo      InventoryRepository
	validator *InventoryValidator
}

func NewController(repo InventoryRepository, validator *InventoryValidator) InventoryController {
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
		response[i] = models.InventoryResponse{
			ID:        inventory.ID,
			Name:      inventory.Name,
			UserID:    inventory.UserID,
			CreatedAt: inventory.CreatedAt,
			UpdatedAt: inventory.UpdatedAt,
		}
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
		return logger.Error(ctx, "Failed to retrieve inventory", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := mapper.ToInventoryResponse(inventory, inventory.Currency)
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

	inventory, currency := mapper.ToCreateInventory(&req, user.ID)
	if err := c.validator.ValidateInventory(inventory); err != nil {
		return err
	}

	if err := c.repo.CreateInventory(inventory, currency); err != nil {
		return logger.Error(ctx, "Failed to create inventory", err, logrus.Fields{
			"inventory_name": inventory.Name,
		})
	}

	response := mapper.ToInventoryResponse(inventory, currency)
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

	existingInventory, err := c.repo.GetInventory(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Inventory not found", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	updatedInventory, updatedCurrency := mapper.ToEditInventory(&req, existingInventory, existingInventory.Currency)
	if err := c.validator.ValidateInventory(updatedInventory); err != nil {
		return err
	}

	if err := c.repo.UpdateInventory(updatedInventory, updatedCurrency); err != nil {
		return logger.Error(ctx, "Failed to update inventory", err, logrus.Fields{
			"inventory_id": inventoryID,
		})
	}

	response := mapper.ToInventoryResponse(updatedInventory, updatedCurrency)
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
