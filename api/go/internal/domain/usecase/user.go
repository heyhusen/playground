package usecase

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/heyhusen/playground/api/go/internal/domain"
	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/idempotency"
	"github.com/heyhusen/playground/api/go/internal/domain/repository"
	"github.com/heyhusen/playground/api/go/internal/id"
	"github.com/heyhusen/playground/api/go/internal/message"
)

// RequestInfo carries the timezone defaults injected by the default-request
// middleware, matching api/node's headers.timezone_* fields.
type RequestInfo struct {
	TimezoneName   string
	TimezoneOffset int
}

// CreateInput is the command for creating a user.
type CreateInput struct {
	RequestInfo

	ID             string
	Attributes     entity.BaseUserEntity
	IdempotencyKey string
	Fingerprint    string
}

// UpdateInput is the command for updating a user.
type UpdateInput struct {
	RequestInfo

	ID              string
	Attributes      map[string]any
	ExpectedVersion *int64
	IdempotencyKey  string
	Fingerprint     string
}

// Service holds the user use cases.
type Service struct {
	Users       repository.UserRepository
	Idempotency idempotency.Store
}

func internalError(err error) *domain.Error {
	return domain.NewError(http.StatusInternalServerError, message.ErrorTitle, err.Error())
}

func userError(err error) *domain.Error {
	if errors.Is(err, repository.ErrNotFound) {
		return domain.NewError(http.StatusNotFound, message.NotFound, message.UserNotExist)
	}

	return internalError(err)
}

func updateError(err error) *domain.Error {
	if errors.Is(err, repository.ErrConflict) {
		return domain.NewError(http.StatusConflict, message.Conflict, message.VersionConflict)
	}

	return userError(err)
}

// UniqueEmail returns an error when email is already used by another user.
func (s *Service) UniqueEmail(ctx context.Context, email, excludeID string) *domain.Error {
	found, err := s.Users.FindByEmail(ctx, email, excludeID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil
	}
	if err != nil {
		return internalError(err)
	}

	if found != nil {
		return domain.NewError(http.StatusBadRequest, message.BadRequest, message.EmailUnique)
	}

	return nil
}

// Create persists a new user, replaying an idempotent request when possible.
func (s *Service) Create(ctx context.Context, in CreateInput) (*entity.User, *domain.Error) {
	if s.Idempotency == nil || in.IdempotencyKey == "" {
		return s.create(ctx, in)
	}

	const scope = "create"
	state, cached, err := s.Idempotency.Check(ctx, scope, in.IdempotencyKey, in.Fingerprint)
	if err != nil {
		return nil, internalError(err)
	}

	switch state {
	case idempotency.Hit:
		return cached, nil
	case idempotency.Mismatch:
		return nil, domain.NewError(http.StatusConflict, message.Conflict, message.IdempotencyMismatch)
	case idempotency.InProgress:
		return nil, domain.NewError(http.StatusConflict, message.Conflict, message.IdempotencyInProgress)
	case idempotency.Miss:
		// No previous attempt: continue to the write below.
	}

	user, apiErr := s.create(ctx, in)
	if apiErr != nil {
		_ = s.Idempotency.Release(ctx, scope, in.IdempotencyKey)

		return nil, apiErr
	}

	err = s.Idempotency.Complete(ctx, scope, in.IdempotencyKey, in.Fingerprint, user)
	if err != nil {
		return nil, internalError(err)
	}

	return user, nil
}

func (s *Service) create(ctx context.Context, in CreateInput) (*entity.User, *domain.Error) {
	if err := s.UniqueEmail(ctx, in.Attributes.Email, ""); err != nil {
		return nil, err
	}

	newID := in.ID
	if newID == "" {
		generated, err := id.New()
		if err != nil {
			return nil, internalError(err)
		}
		newID = generated
	}

	now := time.Now().UnixMilli()
	name := in.TimezoneName
	offset := in.TimezoneOffset

	user := &entity.User{
		ID:                      newID,
		Version:                 1,
		FirstName:               in.Attributes.FirstName,
		LastName:                in.Attributes.LastName,
		Nickname:                in.Attributes.Nickname,
		Email:                   in.Attributes.Email,
		CreatedAt:               now,
		UpdatedAt:               now,
		CreatedAtTimezoneName:   name,
		CreatedAtTimezoneOffset: offset,
		UpdatedAtTimezoneName:   name,
		UpdatedAtTimezoneOffset: offset,
	}

	created, err := s.Users.Create(ctx, user)
	if err != nil {
		return nil, internalError(err)
	}

	return created, nil
}

// Read returns one user by id.
func (s *Service) Read(ctx context.Context, userID string) (*entity.User, *domain.Error) {
	user, err := s.Users.FindByID(ctx, userID)
	if err != nil {
		return nil, userError(err)
	}

	return user, nil
}

// ReadAll returns a page of users and the total row count.
func (s *Service) ReadAll(ctx context.Context, page, size int) ([]entity.User, int64, *domain.Error) {
	users, total, err := s.Users.FindAll(ctx, page, size)
	if err != nil {
		return nil, 0, internalError(err)
	}

	return users, total, nil
}

// Update applies the supplied attributes, replaying an idempotent request.
func (s *Service) Update(ctx context.Context, in UpdateInput) (*entity.User, *domain.Error) {
	if s.Idempotency == nil || in.IdempotencyKey == "" {
		return s.update(ctx, in)
	}

	scope := fmt.Sprintf("update:%s", in.ID)
	state, cached, err := s.Idempotency.Check(ctx, scope, in.IdempotencyKey, in.Fingerprint)
	if err != nil {
		return nil, internalError(err)
	}

	switch state {
	case idempotency.Hit:
		return cached, nil
	case idempotency.Mismatch:
		return nil, domain.NewError(http.StatusConflict, message.Conflict, message.IdempotencyMismatch)
	case idempotency.InProgress:
		return nil, domain.NewError(http.StatusConflict, message.Conflict, message.IdempotencyInProgress)
	case idempotency.Miss:
		// No previous attempt: continue to the write below.
	}

	user, apiErr := s.update(ctx, in)
	if apiErr != nil {
		_ = s.Idempotency.Release(ctx, scope, in.IdempotencyKey)

		return nil, apiErr
	}

	err = s.Idempotency.Complete(ctx, scope, in.IdempotencyKey, in.Fingerprint, user)
	if err != nil {
		return nil, internalError(err)
	}

	return user, nil
}

func applyAttributes(user *entity.User, in UpdateInput) {
	if value, ok := in.Attributes["first_name"].(string); ok {
		user.FirstName = value
	}

	if value, exists := in.Attributes["last_name"]; exists {
		if value == nil {
			user.LastName = nil
		} else if str, ok := value.(string); ok {
			user.LastName = &str
		}
	}

	if value, exists := in.Attributes["nickname"]; exists {
		if value == nil {
			user.Nickname = nil
		} else if str, ok := value.(string); ok {
			user.Nickname = &str
		}
	}

	if value, ok := in.Attributes["email"].(string); ok {
		user.Email = value
	}

	user.UpdatedAt = time.Now().UnixMilli()
	user.UpdatedAtTimezoneName = in.TimezoneName
	user.UpdatedAtTimezoneOffset = in.TimezoneOffset
}

func (s *Service) update(ctx context.Context, in UpdateInput) (*entity.User, *domain.Error) {
	user, err := s.Users.FindByID(ctx, in.ID)
	if err != nil {
		return nil, userError(err)
	}

	// Only enforce uniqueness when the email actually changes.
	if email, ok := in.Attributes["email"].(string); ok && email != user.Email {
		if apiErr := s.UniqueEmail(ctx, email, in.ID); apiErr != nil {
			return nil, apiErr
		}
	}

	applyAttributes(user, in)

	updated, err := s.Users.Update(ctx, user, in.ExpectedVersion)
	if err != nil {
		return nil, updateError(err)
	}

	return updated, nil
}

// Delete removes a user by id.
func (s *Service) Delete(ctx context.Context, userID string) *domain.Error {
	if err := s.Users.Delete(ctx, userID); err != nil {
		return userError(err)
	}

	return nil
}
