package errors

import (
	"fmt"
	"runtime"
	"strings"
)

type ErrorType string

const (
	ValidationErr ErrorType = "VALIDATION_ERROR"
	Unauthorized  ErrorType = "UNAUTHORIZED"
	BadRequest    ErrorType = "BAD_REQUEST"
	Forbidden     ErrorType = "FORBIDDEN"
	NotFound      ErrorType = "NOT_FOUND"
	ConflictErr   ErrorType = "CONFLICT"
	InternalErr   ErrorType = "INTERNAL_ERROR"
	DatabaseErr   ErrorType = "DATABASE_ERROR"
)

// AppError represents application errors
type AppError struct {
	Type      ErrorType `json:"type"`
	Message   string    `json:"message"`
	Details   string    `json:"details"`
	Operation string    `json:"operation,omitempty"`
	Code      int       `json:"code"`
	Stack     string    `json:"-"`
}

// APIError for external API responses
type APIError struct {
	Type    ErrorType `json:"type"`
	Message string    `json:"message"`
	Details string    `json:"details"`
	Code    int       `json:"code"`
}

// ToAPIError converts AppError to APIError
func (e *AppError) ToAPIError() APIError {
	return APIError{
		Type:    e.Type,
		Message: e.Message,
		Details: e.Details,
		Code:    e.Code,
	}
}

func (e *AppError) Error() string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("[%s] %s", e.Type, e.Message))
	if e.Details != "" {
		sb.WriteString(fmt.Sprintf(": %s", e.Details))
	}
	if e.Operation != "" {
		sb.WriteString(fmt.Sprintf(" (Op: %s)", e.Operation))
	}
	return sb.String()
}

func (e *AppError) Is(target error) bool {
	t, ok := target.(*AppError)
	return ok && e.Type == t.Type
}

// getStackTrace returns concise stack trace
func getStackTrace() string {
	const depth = 32
	var pcs [depth]uintptr
	n := runtime.Callers(3, pcs[:])
	frames := runtime.CallersFrames(pcs[:n])

	var sb strings.Builder
	for {
		frame, more := frames.Next()
		if !strings.Contains(frame.File, "runtime/") {
			sb.WriteString(fmt.Sprintf("%s:%d\n", frame.File, frame.Line))
		}
		if !more {
			break
		}
	}
	return sb.String()
}

// New creates a new AppError
func New(errType ErrorType, message string, code int) *AppError {
	return &AppError{
		Type:    errType,
		Message: message,
		Code:    code,
		Stack:   getStackTrace(),
	}
}

// Wrap wraps an existing error
func Wrap(err error, errType ErrorType, message string, code int) *AppError {
	if err == nil {
		return nil
	}

	if appErr, ok := err.(*AppError); ok {
		return &AppError{
			Type:      errType,
			Message:   message,
			Details:   appErr.Details,
			Operation: appErr.Operation,
			Code:      code,
			Stack:     appErr.Stack,
		}
	}

	return &AppError{
		Type:    errType,
		Message: message,
		Details: err.Error(),
		Code:    code,
		Stack:   getStackTrace(),
	}
}

// Helper functions for common errors

func ValidationError(message string) *AppError {
	return New(ValidationErr, message, 400)
}

func UnauthorizedError(message string) *AppError {
	return New(Unauthorized, message, 401)
}

func ForbiddenError(message string) *AppError {
	return New(Forbidden, message, 403)
}

func NotFoundError(message string) *AppError {
	return New(NotFound, message, 404)
}

func ConflictError(message string) *AppError {
	return New(ConflictErr, message, 409)
}

func InternalError(err error, message string) *AppError {
	return Wrap(err, InternalErr, message, 500)
}
