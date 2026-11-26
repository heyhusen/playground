package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/idempotency"
)

const idempotencyTTL = 24 * time.Hour

type idempotencyRecord struct {
	State       string       `json:"state"`
	Fingerprint string       `json:"fingerprint"`
	Data        *entity.User `json:"data,omitempty"`
}

// Idempotency is the Redis-backed idempotency.Store.
type Idempotency struct {
	redis *Redis
}

// NewIdempotency creates a store backed by the shared Redis instance.
func NewIdempotency(redis *Redis) *Idempotency {
	return &Idempotency{redis: redis}
}

// Check claims a key. A second caller with the same key and payload either
// receives the cached result or a conflict; a different payload is a mismatch.
func (s *Idempotency) Check(
	ctx context.Context,
	scope, key, fingerprint string,
) (idempotency.State, *entity.User, error) {
	storageKey := idempotency.StorageKey(scope, key)
	pending, err := json.Marshal(idempotencyRecord{
		State:       "in_progress",
		Fingerprint: fingerprint,
	})
	if err != nil {
		return idempotency.Miss, nil, err
	}

	claimed, err := s.redis.client.SetNX(ctx, storageKey, pending, idempotencyTTL).Result()
	if err != nil {
		return idempotency.Miss, nil, err
	}
	if claimed {
		return idempotency.Miss, nil, nil
	}

	raw, err := s.redis.Get(ctx, storageKey)
	if err != nil {
		return idempotency.Miss, nil, err
	}
	if raw == "" {
		// The previous record expired between SETNX and GET.
		claimed, err = s.redis.client.SetNX(ctx, storageKey, pending, idempotencyTTL).Result()
		if err != nil {
			return idempotency.Miss, nil, err
		}
		if claimed {
			return idempotency.Miss, nil, nil
		}
	}

	var record idempotencyRecord
	err = json.Unmarshal([]byte(raw), &record)
	if err != nil {
		return idempotency.Miss, nil, err
	}
	if record.Fingerprint != fingerprint {
		return idempotency.Mismatch, nil, nil
	}
	if record.State == "completed" {
		return idempotency.Hit, record.Data, nil
	}

	return idempotency.InProgress, nil, nil
}

// Complete stores the result of a successful command for later replay.
func (s *Idempotency) Complete(
	ctx context.Context,
	scope, key, fingerprint string,
	user *entity.User,
) error {
	completed, err := json.Marshal(idempotencyRecord{
		State:       "completed",
		Fingerprint: fingerprint,
		Data:        user,
	})
	if err != nil {
		return err
	}

	return s.redis.Set(ctx, idempotency.StorageKey(scope, key), string(completed), idempotencyTTL)
}

// Release drops a claimed key when the command fails, so a client can retry.
func (s *Idempotency) Release(ctx context.Context, scope, key string) error {
	return s.redis.Delete(ctx, idempotency.StorageKey(scope, key))
}
