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
	r := api.Group("")

	r.GET("/products", controller.ListProducts)
	r.GET("/products/:id", controller.GetProduct)
	r.GET("/categories", controller.ListProductCategories)

	// Auth & CSRF protected routes (write operations)
	w := api.Group("/products")
	w.Use(auth.CSRFMiddleware(service))

	w.POST("", controller.CreateProduct)
	w.PUT("/:id", controller.UpdateProduct)
	w.DELETE("/:id", controller.DeleteProduct)
}
