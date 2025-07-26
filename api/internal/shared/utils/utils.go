package utils

import (
	"fmt"
	"net/http"
	"reflect"
	"strconv"

	"github.com/app/venside/pkg/errors"
	"github.com/app/venside/pkg/logger"
	"github.com/leebenson/conform"

	"mime/multipart"

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

func BindFormData(form *multipart.Form, dest interface{}) error {
	destValue := reflect.ValueOf(dest).Elem()
	destType := destValue.Type()

	for i := 0; i < destType.NumField(); i++ {
		field := destType.Field(i)
		tag := field.Tag.Get("form")
		if tag == "" {
			continue
		}

		// Handle form values
		if values, exists := form.Value[tag]; exists && len(values) > 0 {
			fieldValue := destValue.Field(i)
			switch fieldValue.Kind() {
			case reflect.String:
				fieldValue.SetString(values[0])
			case reflect.Int, reflect.Int64:
				intVal, _ := strconv.ParseInt(values[0], 10, 64)
				fieldValue.SetInt(intVal)
			case reflect.Float64:
				floatVal, _ := strconv.ParseFloat(values[0], 64)
				fieldValue.SetFloat(floatVal)
			case reflect.Bool:
				boolVal, _ := strconv.ParseBool(values[0])
				fieldValue.SetBool(boolVal)
			case reflect.Slice:
				// Already handled separately for categories
			}
		}
	}

	// Clean/sanitize data
	if err := conform.Strings(dest); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return nil
}
