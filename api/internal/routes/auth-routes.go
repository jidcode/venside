package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/labstack/echo/v4"
)

func AuthRoutes(e *echo.Echo, controller auth.IAuthController, service auth.IAuthService) {
	api := e.Group("/api/auth")

	// Public routes
	api.GET("/csrf-token", controller.GetCSRFToken)
	api.POST("/register", controller.Register)
	api.POST("/login", controller.Login)

	// Protected routes
	protected := api.Group("")
	protected.Use(auth.AuthMiddleware(service))
	protected.Use(auth.CSRFMiddleware(service))

	protected.GET("/user-profile", controller.GetUserProfile)
	protected.GET("/check-token", controller.CheckTokenExpiration)
}
