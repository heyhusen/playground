package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/database"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/migration"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	if err := run(os.Args[1:]); err != nil {
		logger.Error("migration failed", "error", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	direction := "up"
	if len(args) > 0 {
		direction = args[0]
	}

	db, err := database.Open(config.Load())
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer db.Close()

	switch direction {
	case "up":
		err = migration.Up(db)
	case "down":
		err = migration.Down(db)
	default:
		return fmt.Errorf("unknown direction: %q", direction)
	}

	if err != nil {
		return fmt.Errorf("migrate: %w", err)
	}

	return nil
}
