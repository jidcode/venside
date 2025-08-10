package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/customers"
	"github.com/labstack/echo/v4"
)

func CustomerRoutes(e *echo.Echo, controller customers.CustomerController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("/customers", controller.ListCustomers)
	readOnly.GET("/customers/:customerId", controller.GetCustomer)

	// Auth & CSRF protected routes (write operations)
	customerGroup := api.Group("/customers")
	customerGroup.Use(auth.CSRFMiddleware(service))
	customerGroup.POST("", controller.CreateCustomer)
	customerGroup.PUT("/:customerId", controller.UpdateCustomer)
	customerGroup.DELETE("/:customerId", controller.DeleteCustomer)
}
