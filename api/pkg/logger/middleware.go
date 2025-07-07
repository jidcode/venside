package logger

import (
	"time"

	"github.com/app/venside/pkg/errors"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

// HTTPErrorsMiddleware handles HTTP errors and logging
func HTTPErrorsMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			err := next(c)
			if err != nil {
				req := c.Request()
				resp := c.Response()

				// Handle AppError
				if appErr, ok := err.(*errors.AppError); ok {
					apiErr := appErr.ToAPIError()

					// Log error with context
					Error(c, "HTTP Request Error", appErr, logrus.Fields{
						"duration_ms": time.Since(start).Milliseconds(),
						"status":      resp.Status,
						"user_agent":  req.UserAgent(),
					})

					// Return API error to client
					return c.JSON(appErr.Code, apiErr)
				}

				// Handle other errors
				Error(c, "Unhandled Error", err, logrus.Fields{
					"duration_ms": time.Since(start).Milliseconds(),
					"status":      resp.Status,
				})

				return err
			}
			return nil
		}
	}
}

// RequestLoggerMiddleware logs all HTTP requests
func RequestLoggerMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			err := next(c)

			req := c.Request()
			resp := c.Response()

			Info("HTTP Request", logrus.Fields{
				"method":      req.Method,
				"path":        req.URL.Path,
				"status":      resp.Status,
				"duration_ms": time.Since(start).Milliseconds(),
				"request_id":  resp.Header().Get("X-Request-ID"),
				"user_agent":  req.UserAgent(),
				"remote_ip":   c.RealIP(),
			})

			return err
		}
	}
}
