package repository

import (
	"context"
	"errors"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
)

// ErrNotFound is returned by repositories when a row does not exist.
var ErrNotFound = errors.New("not found")

// UserRepository is the persistence port used by the user use cases.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	FindByID(ctx context.Context, id string) (*entity.User, error)
	FindByEmail(ctx context.Context, email, excludeID string) (*entity.User, error)
	FindAll(ctx context.Context, page, size int) ([]entity.User, int64, error)
	Update(ctx context.Context, user *entity.User) (*entity.User, error)
	Delete(ctx context.Context, id string) error
}
