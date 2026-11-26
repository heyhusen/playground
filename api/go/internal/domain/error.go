package domain

import "net/http"

// Error is the framework-agnostic HTTP error used by use cases and handlers.
type Error struct {
	Status int
	Title  string
	Detail string

	// Details holds multiple validation messages when present.
	Details []string
}

// NewError builds a single-detail error.
func NewError(status int, title, detail string) *Error {
	return &Error{Status: status, Title: title, Detail: detail}
}

// NewValidationError builds a 422 error carrying every validation message.
func NewValidationError(details ...string) *Error {
	return &Error{
		Status:  http.StatusUnprocessableEntity,
		Title:   "Unprocessable Entity",
		Detail:  details[0],
		Details: details,
	}
}

func (e *Error) Error() string {
	return e.Detail
}
