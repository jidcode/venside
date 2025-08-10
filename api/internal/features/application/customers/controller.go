package customers

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
	repo      CustomerRepository
	validator *CustomerValidator
}

func NewController(repo CustomerRepository, validator *CustomerValidator) CustomerController {
	return &Controller{
		repo:      repo,
		validator: validator,
	}
}

func (c *Controller) ListCustomers(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	customers, err := c.repo.ListCustomers(inventoryID)
	if err != nil {
		return logger.Error(ctx, "Failed to fetch customers", err, logrus.Fields{
			"details":      err.Error(),
			"inventory_id": inventoryID,
		})
	}

	response := make([]models.CustomerResponse, len(customers))
	for i, customer := range customers {
		response[i] = *mapper.ToCustomerResponse(&customer)
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetCustomer(ctx echo.Context) error {
	customerID, err := uuid.Parse(ctx.Param("customerId"))
	if err != nil {
		return errors.ValidationError("Invalid customer ID")
	}

	customer, err := c.repo.GetCustomer(customerID)
	if err != nil {
		return logger.Error(ctx, "Failed to retrieve customer", err, logrus.Fields{
			"details":     err.Error(),
			"customer_id": customerID,
		})
	}

	response := mapper.ToCustomerResponse(&customer)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) CreateCustomer(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	var req models.CustomerRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	newCustomer := mapper.ToCreateCustomer(&req, inventoryID)
	if err := c.validator.ValidateCustomer(newCustomer); err != nil {
		return err
	}

	if err := c.repo.CreateCustomer(newCustomer); err != nil {
		return logger.Error(ctx, "Failed to create customer", err, logrus.Fields{
			"details":       err.Error(),
			"customer_name": newCustomer.Name,
		})
	}

	response := mapper.ToCustomerResponse(newCustomer)
	return ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) UpdateCustomer(ctx echo.Context) error {
	customerID, err := uuid.Parse(ctx.Param("customerId"))
	if err != nil {
		return errors.ValidationError("Invalid customer ID")
	}

	var req models.CustomerRequest
	if err := utils.BindAndValidateRequest(ctx, &req); err != nil {
		return err
	}

	existingCustomer, err := c.repo.GetCustomer(customerID)
	if err != nil {
		return logger.Error(ctx, "Customer not found", err, logrus.Fields{
			"details":     err.Error(),
			"customer_id": customerID,
		})
	}

	updatedCustomer := mapper.ToUpdateCustomer(&req, &existingCustomer)
	if err := c.validator.ValidateCustomer(updatedCustomer); err != nil {
		return err
	}

	if err := c.repo.UpdateCustomer(updatedCustomer); err != nil {
		return logger.Error(ctx, "Failed to update customer", err, logrus.Fields{
			"details":     err.Error(),
			"customer_id": customerID,
		})
	}

	response := mapper.ToCustomerResponse(updatedCustomer)
	return ctx.JSON(http.StatusOK, response)
}

func (c *Controller) DeleteCustomer(ctx echo.Context) error {
	inventoryID, err := uuid.Parse(ctx.Param("inventoryId"))
	if err != nil {
		return errors.ValidationError("Invalid inventory ID")
	}

	customerID, err := uuid.Parse(ctx.Param("customerId"))
	if err != nil {
		return errors.ValidationError("Invalid customer ID")
	}

	if err := c.repo.DeleteCustomer(customerID, inventoryID); err != nil {
		return logger.Error(ctx, "Failed to delete customer", err, logrus.Fields{
			"details":     err.Error(),
			"customer_id": customerID,
		})
	}

	return ctx.NoContent(http.StatusNoContent)
}
