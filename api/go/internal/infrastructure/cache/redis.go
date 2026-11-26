package cache

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/heyhusen/playground/api/go/internal/config"
)

// Redis is a thin wrapper around go-redis used for short-lived lookups.
type Redis struct {
	client *redis.Client
}

// New creates a Redis client (database 1, like api/node).
func New(cfg config.Config) *Redis {
	return &Redis{
		client: redis.NewClient(&redis.Options{
			Addr: fmtAddr(cfg.RedisHost, cfg.RedisPort),
			DB:   1,
		}),
	}
}

func fmtAddr(host string, port int) string {
	return host + ":" + strconv.Itoa(port)
}

// Ping verifies the connection.
func (r *Redis) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// Get returns a cached value or "" when the key is absent.
func (r *Redis) Get(ctx context.Context, key string) (string, error) {
	value, err := r.client.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}

	return value, err
}

// Set stores a value with an expiry.
func (r *Redis) Set(ctx context.Context, key, value string, ttl time.Duration) error {
	return r.client.Set(ctx, key, value, ttl).Err()
}

// Delete removes a key.
func (r *Redis) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// Flush removes everything from the selected database (used by tests).
func (r *Redis) Flush(ctx context.Context) error {
	return r.client.FlushDB(ctx).Err()
}

// Close releases the connection pool.
func (r *Redis) Close() error {
	return r.client.Close()
}
