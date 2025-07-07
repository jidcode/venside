package logger

import (
	"sync"

	"github.com/app/venside/pkg/errors"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

var (
	logger *logrus.Logger
	once   sync.Once
)

// Set up the global logger
func Initialize(env string) {
	once.Do(func() {
		logger = logrus.New()

		if env == "production" {
			logger.SetFormatter(&logrus.JSONFormatter{
				TimestampFormat: "2006-01-02T15:04:05.000Z",
			})
			logger.SetLevel(logrus.InfoLevel)
		} else {
			logger.SetFormatter(&logrus.TextFormatter{
				FullTimestamp:   true,
				TimestampFormat: "15:04:05",
				ForceColors:     true,
			})
			logger.SetLevel(logrus.DebugLevel)
		}
	})
}

// Info logs an informational message
func Info(msg string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Info(msg)
	}
}

// Error logs an error and returns AppError for HTTP response
func Error(c echo.Context, msg string, err error, fields logrus.Fields) error {
	if logger == nil {
		return err
	}

	var appErr *errors.AppError
	if e, ok := err.(*errors.AppError); ok {
		appErr = e
		fields["error_type"] = appErr.Type
		fields["error_code"] = appErr.Code
	} else {
		appErr = errors.InternalError(err, msg)
		fields["error"] = err.Error()
	}

	// Add request context
	fields["request_id"] = c.Response().Header().Get("X-Request-ID")
	fields["method"] = c.Request().Method
	fields["path"] = c.Request().URL.Path

	logger.WithFields(fields).Error(msg)
	return appErr
}

// Fatal logs a fatal message and exits
func Fatal(msg string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Fatal(msg)
	}
}

// Debug logs a debug message
func Debug(msg string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Debug(msg)
	}
}

// Warn logs a warning message
func Warn(msg string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Warn(msg)
	}
}
