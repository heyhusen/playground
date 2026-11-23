package main

import (
	"log/slog"
	"os"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/database"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/migration"
)

func main() {
	direction := "up"
	if len(os.Args) > 1 {
		direction = os.Args[1]
	}

	db, err := database.Open(config.Load())
	if err != nil {
		slog.Error("open database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	switch direction {
	case "up":
		err = migration.Up(db)
	case "down":
		err = migration.Down(db)
	default:
		slog.Error("unknown direction", "direction", direction)
		os.Exit(1)
	}

	if err != nil {
		slog.Error("migrate", "error", err)
		os.Exit(1)
	}
}
