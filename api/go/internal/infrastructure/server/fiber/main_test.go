package fiber

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"testing"

	fiberserver "github.com/gofiber/fiber/v3"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/dal"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/database"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/migration"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/openapi"
)

var (
	testDB  *sql.DB
	testCfg config.Config
)

const seedID = "11111111-1111-7111-8111-111111111111"

func TestMain(m *testing.M) {
	for key, value := range map[string]string{
		"DB_HOST":     "localhost",
		"DB_PORT":     "5432",
		"DB_USERNAME": "postgres",
		"DB_PASSWORD": "postgres",
		"DB_DATABASE": "postgres",
		"APP_URL":     "http://localhost:3000",
	} {
		if os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}

	testCfg = config.Load()

	var err error

	testDB, err = database.Open(testCfg)
	if err != nil {
		panic(err)
	}

	// Start from a clean schema so the suite works whether or not another
	// server's migrations have already been applied to this database.
	for _, statement := range []string{
		"DROP TABLE IF EXISTS users",
		"DROP TABLE IF EXISTS goose_db_version",
	} {
		if _, err := testDB.ExecContext(context.Background(), statement); err != nil {
			panic(err)
		}
	}

	if err := migration.Up(testDB); err != nil {
		panic(err)
	}

	code := m.Run()

	_ = testDB.Close()
	os.Exit(code)
}

// setup resets the database and returns a Fiber app with a seeded user.
func setup(t *testing.T) (*fiberserver.App, entity.User) {
	t.Helper()

	if _, err := testDB.ExecContext(context.Background(), "TRUNCATE users RESTART IDENTITY"); err != nil {
		t.Fatalf("truncate users: %v", err)
	}

	seeded := entity.User{
		ID:                      seedID,
		Version:                 1,
		FirstName:               "John",
		LastName:                stringPtr("Doe"),
		Email:                   "john@example.com",
		CreatedAt:               1,
		UpdatedAt:               1,
		CreatedAtTimezoneName:   "Asia/Jakarta",
		CreatedAtTimezoneOffset: 7,
		UpdatedAtTimezoneName:   "Asia/Jakarta",
		UpdatedAtTimezoneOffset: 7,
	}

	repo := dal.NewUserRepository(testDB)
	if _, err := repo.Create(context.Background(), &seeded); err != nil {
		t.Fatalf("seed user: %v", err)
	}

	service := &usecase.Service{Users: repo}

	doc, err := openapi.Load(testCfg.OpenAPIPath)
	if err != nil {
		t.Fatalf("load openapi: %v", err)
	}

	return New(testCfg, service, doc), seeded
}

func stringPtr(value string) *string {
	return &value
}

func request(t *testing.T, app *fiberserver.App, method, path string, body any) *http.Response {
	t.Helper()

	var payload io.Reader
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("encode body: %v", err)
		}
		payload = bytes.NewReader(encoded)
	}

	req, err := http.NewRequest(method, "http://localhost"+path, payload)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}

	req.Header.Set("Accept", "application/vnd.api+json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("test request: %v", err)
	}

	return resp
}

func decode[T any](t *testing.T, resp *http.Response) T {
	t.Helper()
	defer resp.Body.Close()

	var result T
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	return result
}

type errorDocument struct {
	JSONAPI struct {
		Version string `json:"version"`
	} `json:"jsonapi"`
	Errors []struct {
		Status string `json:"status"`
		Title  string `json:"title"`
		Detail string `json:"detail"`
	} `json:"errors"`
}

func assertError(t *testing.T, resp *http.Response, status int, details ...string) {
	t.Helper()

	if resp.StatusCode != status {
		t.Fatalf("expected status %d, got %d", status, resp.StatusCode)
	}

	doc := decode[errorDocument](t, resp)
	if doc.JSONAPI.Version != "1.1" {
		t.Fatalf("unexpected jsonapi version: %q", doc.JSONAPI.Version)
	}
	if len(doc.Errors) != len(details) {
		t.Fatalf("expected %d errors, got %d: %+v", len(details), len(doc.Errors), doc.Errors)
	}
	for i, detail := range details {
		if doc.Errors[i].Detail != detail {
			t.Fatalf("error %d: expected %q, got %q", i, detail, doc.Errors[i].Detail)
		}
	}
}
