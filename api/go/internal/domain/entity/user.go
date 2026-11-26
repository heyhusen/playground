package entity

// User mirrors the users table defined by api/node's drizzle schema.
type User struct {
	ID                      string  `json:"id"`
	Version                 int64   `json:"version"`
	Cursor                  int64   `json:"cursor"`
	FirstName               string  `json:"first_name"`
	LastName                *string `json:"last_name"`
	Nickname                *string `json:"nickname"`
	Email                   string  `json:"email"`
	CreatedAt               int64   `json:"created_at"`
	UpdatedAt               int64   `json:"updated_at"`
	CreatedAtTimezoneName   string  `json:"created_at_timezone_name"`
	CreatedAtTimezoneOffset int     `json:"created_at_timezone_offset"`
	UpdatedAtTimezoneName   string  `json:"updated_at_timezone_name"`
	UpdatedAtTimezoneOffset int     `json:"updated_at_timezone_offset"`
}

// BaseUserEntity is the writable part of a user.
type BaseUserEntity struct {
	FirstName string
	LastName  *string
	Nickname  *string
	Email     string
}
