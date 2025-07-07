package errors

import "strings"

// Database-specific error types
const (
	DBDuplicateEntry   ErrorType = "DUPLICATE_ENTRY"
	DBForeignKeyError  ErrorType = "FOREIGN_KEY_ERROR"
	DBValidationError  ErrorType = "DB_VALIDATION_ERROR"
	DBConcurrentError  ErrorType = "CONCURRENT_UPDATE"
	DBOperationalError ErrorType = "OPERATIONAL_ERROR"
)

// DatabaseError creates a database-specific AppError
func DatabaseError(err error, operation string) *AppError {
	if pgErr := mapPostgresError(err, operation); pgErr != nil {
		return pgErr
	}

	return &AppError{
		Type:      DatabaseErr,
		Message:   "Database operation failed",
		Details:   err.Error(),
		Operation: operation,
		Code:      500,
		Stack:     getStackTrace(),
	}
}

// mapPostgresError maps PostgreSQL errors to AppError
func mapPostgresError(err error, operation string) *AppError {
	if err == nil {
		return nil
	}

	details := err.Error()

	errorMappings := map[string]*AppError{
		"duplicate key value violates unique constraint": {
			Type: DBDuplicateEntry, Message: "Record already exists", Code: 400,
		},
		"violates foreign key constraint": {
			Type: DBForeignKeyError, Message: "Referenced item not found", Code: 400,
		},
		"value too long for type": {
			Type: DBValidationError, Message: "Input value too long", Code: 400,
		},
		"invalid input syntax": {
			Type: DBValidationError, Message: "Invalid input format", Code: 400,
		},
		"null value in column": {
			Type: DBValidationError, Message: "Required field missing", Code: 400,
		},
		"division by zero": {
			Type: DBValidationError, Message: "Division by zero", Code: 400,
		},
		"out of range": {
			Type: DBValidationError, Message: "Value out of range", Code: 400,
		},
		"could not serialize access due to concurrent update": {
			Type: DBConcurrentError, Message: "Concurrent update conflict", Code: 409,
		},
		"no rows in result set": {
			Type: DBValidationError, Message: "Resource not found", Code: 404,
		},
	}

	for errorText, errorTemplate := range errorMappings {
		if strings.Contains(details, errorText) {
			return &AppError{
				Type:      errorTemplate.Type,
				Message:   errorTemplate.Message,
				Details:   details,
				Operation: operation,
				Code:      errorTemplate.Code,
				Stack:     getStackTrace(),
			}
		}
	}

	return &AppError{
		Type:      DBOperationalError,
		Message:   "Unexpected database error",
		Details:   details,
		Operation: operation,
		Code:      500,
		Stack:     getStackTrace(),
	}
}
