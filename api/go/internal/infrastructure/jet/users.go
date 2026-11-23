package jet

import (
	"github.com/go-jet/jet/v2/postgres"
)

// Users is a hand-written Jet table definition matching the users migration.
// It is the Go equivalent of api/node's drizzle users schema.
type UsersTable struct {
	postgres.Table

	ID                      postgres.ColumnString
	Version                 postgres.ColumnInteger
	Cursor                  postgres.ColumnInteger
	FirstName               postgres.ColumnString
	LastName                postgres.ColumnString
	Nickname                postgres.ColumnString
	Email                   postgres.ColumnString
	CreatedAt               postgres.ColumnInteger
	UpdatedAt               postgres.ColumnInteger
	CreatedAtTimezoneName   postgres.ColumnString
	CreatedAtTimezoneOffset postgres.ColumnInteger
	UpdatedAtTimezoneName   postgres.ColumnString
	UpdatedAtTimezoneOffset postgres.ColumnInteger

	AllColumns postgres.ColumnList
}

func newUsersTable() UsersTable {
	id := postgres.StringColumn("id")
	version := postgres.IntegerColumn("version")
	cursor := postgres.IntegerColumn("cursor")
	firstName := postgres.StringColumn("first_name")
	lastName := postgres.StringColumn("last_name")
	nickname := postgres.StringColumn("nickname")
	email := postgres.StringColumn("email")
	createdAt := postgres.IntegerColumn("created_at")
	updatedAt := postgres.IntegerColumn("updated_at")
	createdName := postgres.StringColumn("created_at_timezone_name")
	createdOffset := postgres.IntegerColumn("created_at_timezone_offset")
	updatedName := postgres.StringColumn("updated_at_timezone_name")
	updatedOffset := postgres.IntegerColumn("updated_at_timezone_offset")

	columns := postgres.ColumnList{
		id, version, cursor, firstName, lastName, nickname, email,
		createdAt, updatedAt, createdName, createdOffset, updatedName, updatedOffset,
	}

	return UsersTable{
		Table:                   postgres.NewTable("public", "users", "", columns...),
		ID:                      id,
		Version:                 version,
		Cursor:                  cursor,
		FirstName:               firstName,
		LastName:                lastName,
		Nickname:                nickname,
		Email:                   email,
		CreatedAt:               createdAt,
		UpdatedAt:               updatedAt,
		CreatedAtTimezoneName:   createdName,
		CreatedAtTimezoneOffset: createdOffset,
		UpdatedAtTimezoneName:   updatedName,
		UpdatedAtTimezoneOffset: updatedOffset,
		AllColumns:              columns,
	}
}

// Users is the singleton table descriptor.
var Users = newUsersTable()
