package repository

import (
	"context"
	"errors"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
)

var (
	// ErrNotFound is returned by repositories when a row does not exist.
	ErrNotFound = errors.New("not found")
	// ErrConflict is returned when a guarded update sees a stale version.
	ErrConflict = errors.New("version conflict")
)

// UserRepository is the persistence port used by the user use cases.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	FindByID(ctx context.Context, id string) (*entity.User, error)
	FindByEmail(ctx context.Context, email, excludeID string) (*entity.User, error)
	FindAll(ctx context.Context, page, size int) ([]entity.User, int64, error)
	// Update increments the version. A non-nil expectedVersion guards the write.
	Update(ctx context.Context, user *entity.User, expectedVersion *int64) (*entity.User, error)
	Delete(ctx context.Context, id string) error
}
