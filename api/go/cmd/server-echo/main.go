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
	echoserver "github.com/heyhusen/playground/api/go/internal/infrastructure/server/echo"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/openapi"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/storage"
)

const serverTimeout = 10 * time.Second

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer db.Close()

	if err = migration.Up(db); err != nil {
		return fmt.Errorf("run migrations: %w", err)
	}

	redisCache := cache.New(cfg)
	defer redisCache.Close()

	if err = redisCache.Ping(context.Background()); err != nil {
		logger.Warn("redis unavailable", "error", err)
	}

	s3, err := storage.New(cfg)
	if err != nil {
		return fmt.Errorf("create s3 client: %w", err)
	}

	if err = s3.EnsureBucket(context.Background()); err != nil {
		logger.Warn("s3 bucket unavailable", "error", err)
	}

	doc, err := openapi.Load(cfg.OpenAPIPath)
	if err != nil {
		logger.Warn("openapi spec unavailable", "error", err)
	}

	service := &usecase.Service{
		Users:       dal.NewUserRepository(db),
		Idempotency: cache.NewIdempotency(redisCache),
	}
	e := echoserver.New(cfg, service, doc)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.AppPort),
		Handler:           e,
		ReadHeaderTimeout: serverTimeout,
	}

	serveErr := make(chan error, 1)
	go func() {
		logger.Info("server up and running", "url", fmt.Sprintf("http://localhost:%d", cfg.AppPort))

		listenErr := server.ListenAndServe()
		if listenErr != nil && !errors.Is(listenErr, http.ErrServerClosed) {
			serveErr <- fmt.Errorf("serve: %w", listenErr)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	select {
	case <-stop:
	case failure := <-serveErr:
		return failure
	}

	ctx, cancel := context.WithTimeout(context.Background(), serverTimeout)
	defer cancel()

	if err = server.Shutdown(ctx); err != nil {
		return fmt.Errorf("shutdown: %w", err)
	}

	return nil
}
