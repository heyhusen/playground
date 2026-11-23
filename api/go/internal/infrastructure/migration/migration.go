package migration

import (
	"database/sql"
	"embed"

	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var migrations embed.FS

// Up applies all embedded migrations, replacing `pnpm db:migrate`.
func Up(db *sql.DB) error {
	goose.SetBaseFS(migrations)
	goose.SetDialect("postgres")

	return goose.Up(db, "migrations")
}

// Down rolls back every migration.
func Down(db *sql.DB) error {
	goose.SetBaseFS(migrations)
	goose.SetDialect("postgres")

	return goose.Down(db, "migrations")
}
