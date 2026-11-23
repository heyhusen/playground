package chi

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/heyhusen/playground/api/go/internal/message"
)

type userAttributes struct {
	FirstName string  `json:"first_name"`
	LastName  *string `json:"last_name"`
	Nickname  *string `json:"nickname"`
	Email     string  `json:"email"`
	CreatedAt int64   `json:"created_at"`
	UpdatedAt int64   `json:"updated_at"`
}

type userResource struct {
	ID         string         `json:"id"`
	Type       string         `json:"type"`
	Attributes userAttributes `json:"attributes"`
}

type userDocument struct {
	JSONAPI struct {
		Version string `json:"version"`
	} `json:"jsonapi"`
	Data json.RawMessage `json:"data"`
}

func decodeUser(t *testing.T, resp *http.Response) userResource {
	t.Helper()

	doc := decode[userDocument](t, resp)
	if doc.JSONAPI.Version != "1.1" {
		t.Fatalf("unexpected jsonapi version: %q", doc.JSONAPI.Version)
	}

	var resource userResource
	if err := json.Unmarshal(doc.Data, &resource); err != nil {
		t.Fatalf("decode resource: %v", err)
	}
	if resource.Type != "users" || resource.ID == "" {
		t.Fatalf("unexpected resource: %+v", resource)
	}

	return resource
}

func decodeUsers(t *testing.T, resp *http.Response) []userResource {
	t.Helper()

	doc := decode[userDocument](t, resp)

	var resources []userResource
	if err := json.Unmarshal(doc.Data, &resources); err != nil {
		t.Fatalf("decode resources: %v", err)
	}

	return resources
}

func TestCreateUserValidation(t *testing.T) {
	server, _ := setup(t)

	tests := []struct {
		name   string
		body   any
		detail string
	}{
		{"empty body", nil, message.BodyRequired},
		{"empty object", map[string]any{}, message.DataRequired},
		{"invalid email", map[string]any{
			"data": map[string]any{
				"type": "users",
				"attributes": map[string]any{
					"first_name": "John",
					"email":      "johndoe",
				},
			},
		}, message.EmailFormat},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := request(t, server, http.MethodPost, "/users", tt.body)
			assertError(t, resp, http.StatusUnprocessableEntity, tt.detail)
		})
	}
}

func TestCreateUserDuplicateEmail(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodPost, "/users", map[string]any{
		"data": map[string]any{
			"type": "users",
			"attributes": map[string]any{
				"first_name": "Jane",
				"email":      "john@example.com",
			},
		},
	})
	defer resp.Body.Close()

	assertError(t, resp, http.StatusBadRequest, message.EmailUnique)
}

func TestCreateUser(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodPost, "/users", map[string]any{
		"data": map[string]any{
			"type": "users",
			"attributes": map[string]any{
				"first_name": "Jane",
				"last_name":  "Doe",
				"email":      "jane@example.com",
			},
		},
	})
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}

	user := decodeUser(t, resp)
	if user.Attributes.FirstName != "Jane" || user.Attributes.Email != "jane@example.com" {
		t.Fatalf("unexpected user: %+v", user)
	}
	if user.Attributes.CreatedAt == 0 || user.Attributes.UpdatedAt == 0 {
		t.Fatalf("timestamps missing: %+v", user)
	}
}

func TestFindAllValidation(t *testing.T) {
	server, _ := setup(t)

	tests := []struct {
		name   string
		query  string
		detail string
	}{
		{"missing query", "", message.PageRequired},
		{"page is not an object", "?page=", message.PageType},
		{"missing number", "?page[size]=10", message.PageNumberRequired},
		{"missing size", "?page[number]=1", message.PageSizeRequired},
		{"wrong types", "?page[number]=x&page[size]=y", message.PageNumberType},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := request(t, server, http.MethodGet, "/users"+tt.query, nil)

			if tt.name == "wrong types" {
				assertError(t, resp, http.StatusUnprocessableEntity, message.PageNumberType, message.PageSizeType)

				return
			}

			assertError(t, resp, http.StatusUnprocessableEntity, tt.detail)
		})
	}
}

func TestFindAll(t *testing.T) {
	server, seeded := setup(t)

	resp := request(t, server, http.MethodGet, "/users?page[number]=1&page[size]=10", nil)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	users := decodeUsers(t, resp)
	if len(users) != 1 || users[0].ID != seeded.ID || users[0].Attributes.Email != seeded.Email {
		t.Fatalf("unexpected users: %+v", users)
	}
}

func TestFindOne(t *testing.T) {
	server, seeded := setup(t)

	tests := []struct {
		name   string
		path   string
		status int
		detail string
	}{
		{"invalid id", "/users/invalid-id", http.StatusUnprocessableEntity, message.IDFormat},
		{"not found", "/users/60677a98-a65e-4abc-831c-45dd76e8f990", http.StatusNotFound, message.UserNotExist},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := request(t, server, http.MethodGet, tt.path, nil)
			assertError(t, resp, tt.status, tt.detail)
		})
	}

	resp := request(t, server, http.MethodGet, "/users/"+seeded.ID, nil)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if user := decodeUser(t, resp); user.Attributes.FirstName != "John" {
		t.Fatalf("unexpected user: %+v", user)
	}
}

func TestUpdateUser(t *testing.T) {
	server, seeded := setup(t)

	tests := []struct {
		name   string
		body   map[string]any
		detail string
	}{
		{"null name", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"first_name": nil}},
		}, message.FirstNameType},
		{"empty name", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"first_name": ""}},
		}, message.FirstNameMinLength},
		{"numeric name", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"first_name": 12345}},
		}, message.FirstNameType},
		{"null email", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"email": nil}},
		}, message.EmailFormat},
		{"empty email", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"email": ""}},
		}, ""},
		{"invalid email", map[string]any{
			"data": map[string]any{"type": "users", "attributes": map[string]any{"email": "johndoe"}},
		}, message.EmailFormat},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := request(t, server, http.MethodPatch, "/users/"+seeded.ID, tt.body)

			if tt.name == "empty email" {
				assertError(t, resp, http.StatusUnprocessableEntity, message.EmailFormat, message.EmailRequired)

				return
			}

			assertError(t, resp, http.StatusUnprocessableEntity, tt.detail)
		})
	}

	resp := request(t, server, http.MethodPatch, "/users/"+seeded.ID, map[string]any{
		"data": map[string]any{
			"type":       "users",
			"attributes": map[string]any{"nickname": nil},
		},
	})
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if user := decodeUser(t, resp); user.Attributes.Nickname != nil {
		t.Fatalf("expected nickname to be cleared, got %v", *user.Attributes.Nickname)
	}

	resp = request(t, server, http.MethodPatch, "/users/"+seeded.ID, map[string]any{
		"data": map[string]any{"type": "users"},
	})
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected no-op update to return 200, got %d", resp.StatusCode)
	}
}

func TestCompatUpdateUser(t *testing.T) {
	server, seeded := setup(t)

	tests := []struct {
		name    string
		body    any
		details []string
	}{
		{"empty body", nil, []string{message.BodyRequired}},
		{"empty object", map[string]any{}, []string{message.DataRequired}},
		{"empty data", map[string]any{"data": map[string]any{}}, []string{message.DataIDRequired, message.DataTypeRequired}},
		{"invalid type", map[string]any{
			"data": map[string]any{"type": "user"},
		}, []string{message.DataIDRequired, message.DataTypePattern}},
		{"null email", map[string]any{
			"data": map[string]any{"id": seeded.ID, "type": "users", "attributes": map[string]any{"email": nil}},
		}, []string{message.EmailType}},
		{"empty email", map[string]any{
			"data": map[string]any{"id": seeded.ID, "type": "users", "attributes": map[string]any{"email": ""}},
		}, []string{message.EmailFormat, message.EmailRequired}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := request(t, server, http.MethodPut, "/users", tt.body)
			assertError(t, resp, http.StatusUnprocessableEntity, tt.details...)
		})
	}

	resp := request(t, server, http.MethodPut, "/users", map[string]any{
		"data": map[string]any{"id": seeded.ID, "type": "users"},
	})
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestDeleteUser(t *testing.T) {
	server, seeded := setup(t)

	resp := request(t, server, http.MethodDelete, "/users/invalid-id", nil)
	assertError(t, resp, http.StatusUnprocessableEntity, message.IDFormat)

	resp = request(t, server, http.MethodDelete, "/users/"+seeded.ID, nil)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", resp.StatusCode)
	}

	resp = request(t, server, http.MethodDelete, "/users/"+seeded.ID, nil)
	assertError(t, resp, http.StatusNotFound, message.UserNotExist)
}
