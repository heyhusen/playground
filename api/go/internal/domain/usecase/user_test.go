package usecase_test

import (
	"context"
	"testing"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/idempotency"
	"github.com/heyhusen/playground/api/go/internal/domain/repository"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/cache"
	"github.com/heyhusen/playground/api/go/internal/message"
)

type fakeUsers struct {
	rows    map[string]*entity.User
	nextID  int64
	failAll bool
}

func newFakeUsers() *fakeUsers {
	return &fakeUsers{rows: map[string]*entity.User{}}
}

func (f *fakeUsers) Create(_ context.Context, user *entity.User) (*entity.User, error) {
	f.nextID++
	copy := *user
	copy.Cursor = f.nextID
	f.rows[copy.ID] = &copy

	return &copy, nil
}

func (f *fakeUsers) FindByID(_ context.Context, userID string) (*entity.User, error) {
	user, ok := f.rows[userID]
	if !ok {
		return nil, repository.ErrNotFound
	}

	copy := *user

	return &copy, nil
}

func (f *fakeUsers) FindByEmail(_ context.Context, email, excludeID string) (*entity.User, error) {
	for _, user := range f.rows {
		if user.Email == email && user.ID != excludeID {
			copy := *user

			return &copy, nil
		}
	}

	return nil, nil
}

func (f *fakeUsers) FindAll(_ context.Context, page, size int) ([]entity.User, int64, error) {
	users := make([]entity.User, 0, len(f.rows))
	for _, user := range f.rows {
		users = append(users, *user)
	}

	start := (page - 1) * size
	if start >= len(users) {
		return []entity.User{}, int64(len(users)), nil
	}

	end := start + size
	if end > len(users) {
		end = len(users)
	}

	return users[start:end], int64(len(users)), nil
}

func (f *fakeUsers) Update(_ context.Context, user *entity.User, expectedVersion *int64) (*entity.User, error) {
	current, ok := f.rows[user.ID]
	if !ok {
		return nil, repository.ErrNotFound
	}
	if expectedVersion != nil && *expectedVersion != current.Version {
		return nil, repository.ErrConflict
	}

	user.Version = current.Version + 1
	f.rows[user.ID] = user

	return user, nil
}

func (f *fakeUsers) Delete(_ context.Context, userID string) error {
	if _, ok := f.rows[userID]; !ok {
		return repository.ErrNotFound
	}
	delete(f.rows, userID)

	return nil
}

func requestInfo() usecase.RequestInfo {
	return usecase.RequestInfo{TimezoneName: "Asia/Jakarta", TimezoneOffset: 7}
}

func TestCreate(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	user, apiErr := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}

	if user.Version != 1 || user.Cursor != 1 {
		t.Fatalf("unexpected version/cursor: %d/%d", user.Version, user.Cursor)
	}
	if user.CreatedAtTimezoneName != "Asia/Jakarta" || user.CreatedAtTimezoneOffset != 7 {
		t.Fatalf("timezone defaults not applied: %+v", user)
	}
	if user.ID == "" || user.CreatedAt == 0 {
		t.Fatalf("id/timestamps were not generated: %+v", user)
	}
}

func TestCreateDuplicateEmail(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	_, _ = service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})

	_, apiErr := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "Jane",
			Email:     "john@example.com",
		},
	})
	if apiErr == nil {
		t.Fatal("expected duplicate email error")
	}
	if apiErr.Status != 400 || apiErr.Detail != message.EmailUnique {
		t.Fatalf("unexpected error: %+v", apiErr)
	}
}

type unusedIdempotency struct{}

func (unusedIdempotency) Check(context.Context, string, string, string) (idempotency.State, *entity.User, error) {
	panic("idempotency store must not be used without a key")
}

func (unusedIdempotency) Complete(context.Context, string, string, string, *entity.User) error {
	panic("idempotency store must not be used without a key")
}

func (unusedIdempotency) Release(context.Context, string, string) error {
	panic("idempotency store must not be used without a key")
}

func TestWritesWithoutIdempotencyKey(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo, Idempotency: unusedIdempotency{}}

	created, apiErr := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}

	updated, apiErr := service.Update(context.Background(), usecase.UpdateInput{
		RequestInfo:    requestInfo(),
		ID:             created.ID,
		Attributes:     map[string]any{"first_name": "Jane"},
		IdempotencyKey: "",
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if updated.ID != created.ID || updated.Version != created.Version+1 {
		t.Fatalf("unexpected result: %+v", updated)
	}
}

func redisIdempotency(t *testing.T) idempotency.Store {
	t.Helper()

	redisCache := cache.New(config.Load())
	if err := redisCache.Flush(context.Background()); err != nil {
		t.Fatalf("flush redis: %v", err)
	}
	t.Cleanup(func() { _ = redisCache.Close() })

	return cache.NewIdempotency(redisCache)
}

func TestCreateIdempotent(t *testing.T) {
	repo := newFakeUsers()
	store := redisIdempotency(t)
	service := &usecase.Service{Users: repo, Idempotency: store}

	in := usecase.CreateInput{
		RequestInfo:    requestInfo(),
		Attributes:     entity.BaseUserEntity{FirstName: "John", Email: "john@example.com"},
		IdempotencyKey: "create-key",
		Fingerprint:    "create-fingerprint",
	}

	first, apiErr := service.Create(context.Background(), in)
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	second, apiErr := service.Create(context.Background(), in)
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if first.ID != second.ID || len(repo.rows) != 1 {
		t.Fatalf("retry created a second user: %d rows", len(repo.rows))
	}
}

func TestCreateIdempotencyMismatch(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{
		Users:       repo,
		Idempotency: redisIdempotency(t),
	}

	in := usecase.CreateInput{
		RequestInfo:    requestInfo(),
		Attributes:     entity.BaseUserEntity{FirstName: "John", Email: "john@example.com"},
		IdempotencyKey: "create-key",
		Fingerprint:    "first-fingerprint",
	}
	if _, apiErr := service.Create(context.Background(), in); apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}

	in.Fingerprint = "different-fingerprint"
	_, apiErr := service.Create(context.Background(), in)
	if apiErr == nil || apiErr.Status != 409 || apiErr.Detail != message.IdempotencyMismatch {
		t.Fatalf("unexpected error: %+v", apiErr)
	}
}

func TestUpdateIdempotent(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{
		Users:       repo,
		Idempotency: redisIdempotency(t),
	}

	created, _ := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes:  entity.BaseUserEntity{FirstName: "John", Email: "john@example.com"},
	})

	in := usecase.UpdateInput{
		RequestInfo:    requestInfo(),
		ID:             created.ID,
		Attributes:     map[string]any{"first_name": "Jane"},
		IdempotencyKey: "update-key",
		Fingerprint:    "update-fingerprint",
	}

	first, apiErr := service.Update(context.Background(), in)
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	second, apiErr := service.Update(context.Background(), in)
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if second.Version != first.Version || second.Version != created.Version+1 {
		t.Fatalf("retry bumped the version twice: %d -> %d", first.Version, second.Version)
	}
}

func TestReadNotFound(t *testing.T) {
	service := &usecase.Service{Users: newFakeUsers()}

	_, apiErr := service.Read(context.Background(), "missing")
	if apiErr == nil || apiErr.Status != 404 || apiErr.Detail != message.UserNotExist {
		t.Fatalf("unexpected error: %+v", apiErr)
	}
}

func TestUpdate(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	created, apiErr := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}

	nickname := "Johnny"
	updated, apiErr := service.Update(context.Background(), usecase.UpdateInput{
		RequestInfo: requestInfo(),
		ID:          created.ID,
		Attributes: map[string]any{
			"first_name": "Jane",
			"nickname":   nickname,
		},
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if updated.FirstName != "Jane" || updated.Nickname == nil || *updated.Nickname != "Johnny" {
		t.Fatalf("update not applied: %+v", updated)
	}
}

func TestUpdateWithVersion(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	created, _ := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})

	updated, apiErr := service.Update(context.Background(), usecase.UpdateInput{
		RequestInfo:     requestInfo(),
		ID:              created.ID,
		Attributes:      map[string]any{"first_name": "Jane"},
		ExpectedVersion: int64Ptr(created.Version),
	})
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if updated.Version != created.Version+1 {
		t.Fatalf("expected version %d, got %d", created.Version+1, updated.Version)
	}
}

func TestUpdateWithStaleVersion(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	created, _ := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})

	_, apiErr := service.Update(context.Background(), usecase.UpdateInput{
		RequestInfo:     requestInfo(),
		ID:              created.ID,
		Attributes:      map[string]any{"first_name": "Jane"},
		ExpectedVersion: int64Ptr(created.Version + 1),
	})
	if apiErr == nil || apiErr.Status != 409 || apiErr.Detail != message.VersionConflict {
		t.Fatalf("unexpected error: %+v", apiErr)
	}
}

func int64Ptr(value int64) *int64 {
	return &value
}

func TestUpdateNotFound(t *testing.T) {
	service := &usecase.Service{Users: newFakeUsers()}

	_, apiErr := service.Update(context.Background(), usecase.UpdateInput{
		RequestInfo: requestInfo(),
		ID:          "missing",
		Attributes:  map[string]any{"first_name": "Jane"},
	})
	if apiErr == nil || apiErr.Status != 404 {
		t.Fatalf("unexpected error: %+v", apiErr)
	}
}

func TestDelete(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	created, _ := service.Create(context.Background(), usecase.CreateInput{
		RequestInfo: requestInfo(),
		Attributes: entity.BaseUserEntity{
			FirstName: "John",
			Email:     "john@example.com",
		},
	})

	if apiErr := service.Delete(context.Background(), created.ID); apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if apiErr := service.Delete(context.Background(), created.ID); apiErr == nil || apiErr.Status != 404 {
		t.Fatalf("expected not found on second delete: %+v", apiErr)
	}
}

func TestReadAll(t *testing.T) {
	repo := newFakeUsers()
	service := &usecase.Service{Users: repo}

	for i := 0; i < 3; i++ {
		_, _ = service.Create(context.Background(), usecase.CreateInput{
			RequestInfo: requestInfo(),
			Attributes: entity.BaseUserEntity{
				FirstName: "John",
				Email:     "john" + string(rune('0'+i)) + "@example.com",
			},
		})
	}

	users, total, apiErr := service.ReadAll(context.Background(), 2, 2)
	if apiErr != nil {
		t.Fatalf("unexpected error: %v", apiErr)
	}
	if total != 3 || len(users) != 1 {
		t.Fatalf("unexpected page: total=%d len=%d", total, len(users))
	}
}
