package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/cache"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/dal"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/database"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/migration"
	chiserver "github.com/heyhusen/playground/api/go/internal/infrastructure/server/chi"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/chi/openapi"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/storage"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		slog.Error("open database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	if err := migration.Up(db); err != nil {
		slog.Error("run migrations", "error", err)
		os.Exit(1)
	}

	redisCache := cache.New(cfg)
	defer redisCache.Close()

	if err := redisCache.Ping(context.Background()); err != nil {
		slog.Warn("redis unavailable", "error", err)
	}

	s3, err := storage.New(cfg)
	if err != nil {
		slog.Error("create s3 client", "error", err)
		os.Exit(1)
	}

	if err := s3.EnsureBucket(context.Background()); err != nil {
		slog.Warn("s3 bucket unavailable", "error", err)
	}

	doc, err := openapi.Load(cfg.OpenAPIPath)
	if err != nil {
		slog.Warn("openapi spec unavailable", "error", err)
	}

	service := &usecase.Service{Users: dal.NewUserRepository(db)}
	handler := chiserver.New(cfg, service, doc)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.AppPort),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		slog.Info("server up and running", "url", fmt.Sprintf("http://localhost:%d", cfg.AppPort))

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("serve", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("shutdown", "error", err)
	}
}
