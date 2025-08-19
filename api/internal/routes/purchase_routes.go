package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/app/venside/internal/features/application/purchases"
	"github.com/labstack/echo/v4"
)

func PurchaseRoutes(e *echo.Echo, controller purchases.PurchaseController, service auth.AuthService) {
	api := e.Group("/api/inventories/:inventoryId")

	// Auth protected routes (read-only)
	api.Use(auth.AuthMiddleware(service))
	readOnly := api.Group("")
	readOnly.GET("/purchases", controller.ListPurchases)
	readOnly.GET("/purchases/:purchaseId", controller.GetPurchase)

	// Auth & CSRF protected routes (write operations)
	purchasesGroup := api.Group("/purchases")
	// purchasesGroup.Use(auth.CSRFMiddleware(service))
	purchasesGroup.POST("", controller.CreatePurchase)
	purchasesGroup.DELETE("/:purchaseId", controller.DeletePurchase)
}
