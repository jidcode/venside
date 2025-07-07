package utils

import (
	"fmt"

	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

func BindAndValidateRequest(ctx echo.Context, request interface{}) error {
	if err := ctx.Bind(request); err != nil {
		logger.Error(ctx, "Failed to bind request input", err, logrus.Fields{
			"path":   ctx.Path(),
			"method": ctx.Request().Method,
		})
		return errors.Wrap(err, errors.BadRequest, "Failed to parse request", 400)
	}

	if err := ctx.Validate(request); err != nil {
		logger.Error(ctx, "Request validation failed", err, logrus.Fields{
			"path":         ctx.Path(),
			"method":       ctx.Request().Method,
			"request_type": fmt.Sprintf("%T", request),
		})
		return errors.Wrap(err, errors.ValidationErr, "Request validation failed", 400)
	}

	return nil
}
