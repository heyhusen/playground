package domain

// Error is the framework-agnostic HTTP error used by use cases and handlers.
type Error struct {
	Status int
	Title  string
	Detail string

	// Details holds multiple validation messages when present.
	Details []string
}

func (e *Error) Error() string {
	return e.Detail
}

// NewError builds a single-detail error.
func NewError(status int, title, detail string) *Error {
	return &Error{Status: status, Title: title, Detail: detail}
}

// NewValidationError builds a 422 error carrying every validation message.
func NewValidationError(details ...string) *Error {
	return &Error{
		Status:  422,
		Title:   "Unprocessable Entity",
		Detail:  details[0],
		Details: details,
	}
}
