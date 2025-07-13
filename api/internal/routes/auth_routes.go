package routes

import (
	"github.com/app/venside/internal/features/account/auth"
	"github.com/labstack/echo/v4"
)

func AuthRoutes(e *echo.Echo, controller auth.AuthController, service auth.AuthService) {
	api := e.Group("/api/auth")

	// Public routes
	api.GET("/csrf-token", controller.GetCSRFToken)
	api.POST("/register", controller.Register)

	// Login needs CSRF protection
	loginGroup := api.Group("")
	loginGroup.Use(auth.CSRFMiddleware(service))
	loginGroup.POST("/login", controller.Login)

	// Protected routes (GET - no CSRF required)
	protected := api.Group("")
	protected.Use(auth.AuthMiddleware(service))
	protected.GET("/user-profile", controller.GetUserProfile)
	protected.GET("/check-token", controller.CheckTokenExpiration)
}
