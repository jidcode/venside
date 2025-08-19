package purchases

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
	repo PurchaseRepository
}

func NewController(repo PurchaseRepository) PurchaseController {
	return &Controller{
		repo: repo,
	}
}

func (c *Controller) ListPurchases(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	purchases, err := c.repo.ListPurchases(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch purchases", err, logrus.Fields{
			"details":      err.Error(),
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.PurchaseResponse, len(purchases))
	for i, purchase := range purchases {
		response[i] = *mapper.ToPurchaseResponse(&purchase)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetPurchase(ctx echo.Context) error {
	purchaseID, err := uuid.Parse(ctx.Param("purchaseId"))
	if err != nil {
		return errors.ValidationError("Invalid purchase ID")
	}

	purchase, err := c.repo.GetPurchase(purchaseID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve purchase", err, logrus.Fields{
			"details":     err.Error(),
			"purchase_id": purchaseID,
		})
	}

	response := mapper.ToPurchaseResponse(&purchase)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreatePurchase(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.PurchaseRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newPurchase := mapper.ToCreatePurchase(&req, inventoryID)

	if err := c.repo.CreatePurchase(newPurchase); err != nil {
		return logger.Error(ctx, "Failed to create purchase", err, logrus.Fields{
			"details":       err.Error(),
			"vendor_name":   newPurchase.VendorName,
			"purchase_date": newPurchase.PurchaseDate,
		})
	}

	response := mapper.ToPurchaseResponse(newPurchase)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) DeletePurchase(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	purchaseID, err := uuid.Parse(ctx.Param("purchaseId"))
	if err != nil {
		return errors.ValidationError("Invalid purchase ID")
	}

	if err := c.repo.DeletePurchase(purchaseID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete purchase", err, logrus.Fields{
			"details":     err.Error(),
			"purchase_id": purchaseID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
