package vendors

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
	repo      VendorRepository
	validator *VendorValidator
}

func NewController(repo VendorRepository, validator *VendorValidator) VendorController {
	return &Controller{
		repo:      repo,
		validator: validator,
	}
}

func (c *Controller) ListVendors(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	vendors, err := c.repo.ListVendors(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch vendors", err, logrus.Fields{
			"details":      err.Error(),
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.VendorResponse, len(vendors))
	for i, vendor := range vendors {
		response[i] = *mapper.ToVendorResponse(&vendor)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetVendor(ctx echo.Context) error {
	vendorID, err := uuid.Parse(ctx.Param("vendorId"))
	if err != nil {
		return errors.ValidationError("Invalid vendor ID")
	}

	vendor, err := c.repo.GetVendor(vendorID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve vendor", err, logrus.Fields{
			"details":   err.Error(),
			"vendor_id": vendorID,
		})
	}

	response := mapper.ToVendorResponse(&vendor)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateVendor(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.VendorRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newVendor := mapper.ToCreateVendor(&req, inventoryID)
	if err := c.validator.ValidateVendor(newVendor); err != nil {
		return err
	}

	if err := c.repo.CreateVendor(newVendor); err != nil {
		return logger.Error(ctx, "Failed to create vendor", err, logrus.Fields{
			"details":      err.Error(),
			"company_name": newVendor.CompanyName,
		})
	}

	response := mapper.ToVendorResponse(newVendor)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateVendor(ctx echo.Context) error {
	vendorID, err := uuid.Parse(ctx.Param("vendorId"))
	if err != nil {
		return errors.ValidationError("Invalid vendor ID")
	}

	var req models.VendorRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	existingVendor, err := c.repo.GetVendor(vendorID)
	if err != nil {
		return logger.Error(ctx, "Vendor not found", err, logrus.Fields{
			"details":   err.Error(),
			"vendor_id": vendorID,
		})
	}

	updatedVendor := mapper.ToUpdateVendor(&req, &existingVendor)
	if err := c.validator.ValidateVendor(updatedVendor); err != nil {
		return err
	}

	if err := c.repo.UpdateVendor(updatedVendor); err != nil {
		return logger.Error(ctx, "Failed to update vendor", err, logrus.Fields{
			"details":   err.Error(),
			"vendor_id": vendorID,
		})
	}

	response := mapper.ToVendorResponse(updatedVendor)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteVendor(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	vendorID, err := uuid.Parse(ctx.Param("vendorId"))
	if err != nil {
		return errors.ValidationError("Invalid vendor ID")
	}

	if err := c.repo.DeleteVendor(vendorID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete vendor", err, logrus.Fields{
			"details":   err.Error(),
			"vendor_id": vendorID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
