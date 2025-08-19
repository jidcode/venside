package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/vendors"
	"github.com/labstack/echo/v4"
)

func VendorRoutes(e *echo.Echo, controller vendors.VendorController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("/vendors", controller.ListVendors)
	readOnly.GET("/vendors/:vendorId", controller.GetVendor)

	// Auth & CSRF protected routes (write operations)
	vendorGroup := api.Group("/vendors")
	vendorGroup.Use(auth.CSRFMiddleware(service))
	vendorGroup.POST("", controller.CreateVendor)
	vendorGroup.PUT("/:vendorId", controller.UpdateVendor)
	vendorGroup.DELETE("/:vendorId", controller.DeleteVendor)
}
