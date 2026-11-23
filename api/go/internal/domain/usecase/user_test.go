package usecase_test

import (
	"context"
	"testing"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/repository"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
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

func (f *fakeUsers) Update(_ context.Context, user *entity.User) (*entity.User, error) {
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
