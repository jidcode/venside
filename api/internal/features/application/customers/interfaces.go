package customers

import (
	"github.com/app/venside/internal/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type CustomerRepository interface {
	ListCustomers(inventoryID uuid.UUID) ([]models.Customer, error)
	GetCustomer(customerID uuid.UUID) (models.Customer, error)
	CreateCustomer(customer *models.Customer) error
	UpdateCustomer(customer *models.Customer) error
	DeleteCustomer(customerID, inventoryID uuid.UUID) error
}

type CustomerController interface {
	ListCustomers(ctx echo.Context) error
	GetCustomer(ctx echo.Context) error
	CreateCustomer(ctx echo.Context) error
	UpdateCustomer(ctx echo.Context) error
	DeleteCustomer(ctx echo.Context) error
}
