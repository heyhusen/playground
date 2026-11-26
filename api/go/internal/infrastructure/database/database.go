package database

import (
	"database/sql"
	"fmt"

	// Register the pgx driver referenced by sql.Open("pgx", ...) below.
	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/heyhusen/playground/api/go/internal/config"
)

const (
	maxOpenConns = 30
	maxIdleConns = 5
)

// Open creates a database/sql pool backed by the pgx driver.
func Open(cfg config.Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUsername, cfg.DBPassword, cfg.DBDatabase,
	)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)

	return db, nil
}
