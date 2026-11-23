package id

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
)

var uuidV4 = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// IsValid reports whether the value is a UUID v4 string.
func IsValid(value string) bool {
	return uuidV4.MatchString(value)
}

// New generates a random UUID v4 without pulling in an extra dependency.
func New() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	s := hex.EncodeToString(b)

	return s[0:8] + "-" + s[8:12] + "-" + s[12:16] + "-" + s[16:20] + "-" + s[20:32], nil
}
