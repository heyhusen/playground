package idempotency

import (
	"context"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
)

// State is the outcome of claiming an idempotency key.
type State string

const (
	Miss       State = "miss"
	Hit        State = "hit"
	InProgress State = "in_progress"
	Mismatch   State = "mismatch"
)

// Store claims keys atomically and remembers completed results so retries can
// be replayed instead of repeating the write.
type Store interface {
	Check(ctx context.Context, scope, key, fingerprint string) (State, *entity.User, error)
	Complete(ctx context.Context, scope, key, fingerprint string, user *entity.User) error
	Release(ctx context.Context, scope, key string) error
}

// StorageKey namespaces a client key by operation so the same key can be
// reused safely for a create and an update.
func StorageKey(scope, key string) string {
	return "idempotency:" + scope + ":" + key
}
