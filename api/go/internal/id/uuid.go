package id

import (
	"regexp"

	"github.com/google/uuid"
)

var uuidV7 = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// IsValid reports whether the value is a UUID v7 string.
func IsValid(value string) bool {
	return uuidV7.MatchString(value)
}

// New generates a time-ordered UUID v7.
func New() (string, error) {
	value, err := uuid.NewV7()
	if err != nil {
		return "", err
	}

	return value.String(), nil
}
