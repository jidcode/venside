package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/products"
	"github.com/labstack/echo/v4"
)

func ProductRoutes(e *echo.Echo, controller products.ProductController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("/products", controller.ListProducts)
	readOnly.GET("/products/:id", controller.GetProduct)
	readOnly.GET("/categories", controller.ListProductCategories)

	// Auth & CSRF protected routes (write operations)
	prdGroup := api.Group("/products")
	prdGroup.Use(auth.CSRFMiddleware(service))
	prdGroup.POST("", controller.CreateProduct)
	prdGroup.PUT("/:id", controller.UpdateProduct)
	prdGroup.DELETE("/:id", controller.DeleteProduct)
	prdGroup.DELETE("", controller.DeleteMultipleProducts)

	imgGroup := api.Group("/images")
	imgGroup.Use(auth.CSRFMiddleware(service))
	imgGroup.PUT("/:imageId/primary", controller.SetPrimaryImage)
}
