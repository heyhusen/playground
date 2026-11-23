package entity

// User mirrors the users table defined by api/node's drizzle schema.
type User struct {
	ID                      string
	Version                 int64
	Cursor                  int64
	FirstName               string
	LastName                *string
	Nickname                *string
	Email                   string
	CreatedAt               int64
	UpdatedAt               int64
	CreatedAtTimezoneName   string
	CreatedAtTimezoneOffset int
	UpdatedAtTimezoneName   string
	UpdatedAtTimezoneOffset int
}

// BaseUserEntity is the writable part of a user.
type BaseUserEntity struct {
	FirstName string
	LastName  *string
	Nickname  *string
	Email     string
}
