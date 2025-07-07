package utils

import (
	"fmt"

	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

func BindAndValidateRequest(ctx echo.Context, input interface{}) error {
	if err := ctx.Bind(input); err != nil {
		logger.Error(ctx, "Failed to bind request input", err, logrus.Fields{
			"path":   ctx.Path(),
			"method": ctx.Request().Method,
		})
		return errors.Wrap(err, errors.BadRequest, "Failed to parse request body", 400)
	}

	if err := ctx.Validate(input); err != nil {
		logger.Error(ctx, "Input validation failed", err, logrus.Fields{
			"path":       ctx.Path(),
			"method":     ctx.Request().Method,
			"input_type": fmt.Sprintf("%T", input),
		})
		return errors.Wrap(err, errors.ValidationErr, "Input validation failed", 400)
	}

	return nil
}
