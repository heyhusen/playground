package handler

import (
	"fmt"
	"net/http"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/chi/middleware"
	idem "github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/idempotency"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/jsonapi"
)

// User holds the HTTP adapter for the user use cases.
type User struct {
	Service *usecase.Service
	BaseURL string
}

func resource(user *entity.User, baseURL string) jsonapi.Resource {
	return jsonapi.Resource{
		ID:   user.ID,
		Type: "users",
		Attributes: jsonapi.UserAttributes{
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Nickname:  user.Nickname,
			Email:     user.Email,
			Version:   user.Version,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
		Links: map[string]string{
			"self": fmt.Sprintf("%s/users/%s", baseURL, user.ID),
		},
	}
}

func (h *User) pageLink(number, size int) string {
	return fmt.Sprintf("%s/users/?page[number]=%d&page[size]=%d", h.BaseURL, number, size)
}

// Create handles POST /users.
func (h *User) Create(w http.ResponseWriter, r *http.Request) {
	body := middleware.CreateBody(r)
	info := middleware.RequestInfo(r)

	user, apiErr := h.Service.Create(r.Context(), usecase.CreateInput{
		RequestInfo: info,
		ID:          body.ID,
		Attributes: entity.BaseUserEntity{
			FirstName: body.FirstName,
			LastName:  body.LastName,
			Nickname:  body.Nickname,
			Email:     body.Email,
		},
		IdempotencyKey: r.Header.Get("Idempotency-Key"),
		Fingerprint:    idem.Fingerprint(body),
	})
	if apiErr != nil {
		jsonapi.WriteError(w, apiErr)

		return
	}

	jsonapi.WriteData(w, http.StatusCreated, resource(user, h.BaseURL), nil, nil)
}

// Read handles GET /users/{id}.
func (h *User) Read(w http.ResponseWriter, r *http.Request) {
	user, apiErr := h.Service.Read(r.Context(), middleware.ID(r))
	if apiErr != nil {
		jsonapi.WriteError(w, apiErr)

		return
	}

	jsonapi.WriteData(w, http.StatusOK, resource(user, h.BaseURL), nil, nil)
}

// ReadAll handles GET /users.
func (h *User) ReadAll(w http.ResponseWriter, r *http.Request) {
	page := middleware.PageQuery(r)

	users, total, apiErr := h.Service.ReadAll(r.Context(), page.Number, page.Size)
	if apiErr != nil {
		jsonapi.WriteError(w, apiErr)

		return
	}

	data := make([]jsonapi.Resource, 0, len(users))
	for i := range users {
		data = append(data, resource(&users[i], h.BaseURL))
	}

	totalPages := 0
	if page.Size > 0 {
		totalPages = int((total + int64(page.Size) - 1) / int64(page.Size))
	}

	prev := page.Number - 1
	if prev < 1 {
		prev = 0
	}

	next := page.Number + 1
	if next > totalPages {
		next = 0
	}

	links := map[string]any{
		"first": h.pageLink(1, page.Size),
		"last":  h.pageLink(totalPages, page.Size),
		"prev":  nil,
		"next":  nil,
	}
	if prev > 0 {
		links["prev"] = h.pageLink(prev, page.Size)
	}
	if next > 0 {
		links["next"] = h.pageLink(next, page.Size)
	}

	jsonapi.WriteData(w, http.StatusOK, data, links, nil)
}

// Update handles PATCH /users/{id} and PUT /users.
func (h *User) Update(w http.ResponseWriter, r *http.Request) {
	body := middleware.UpdateBody(r)

	user, apiErr := h.Service.Update(r.Context(), usecase.UpdateInput{
		RequestInfo:     middleware.RequestInfo(r),
		ID:              body.ID,
		Attributes:      body.Attributes,
		ExpectedVersion: body.Version,
		IdempotencyKey:  r.Header.Get("Idempotency-Key"),
		Fingerprint:     idem.Fingerprint(body.Attributes),
	})
	if apiErr != nil {
		jsonapi.WriteError(w, apiErr)

		return
	}

	jsonapi.WriteData(w, http.StatusOK, resource(user, h.BaseURL), nil, nil)
}

// Delete handles DELETE /users/{id}.
func (h *User) Delete(w http.ResponseWriter, r *http.Request) {
	if apiErr := h.Service.Delete(r.Context(), middleware.ID(r)); apiErr != nil {
		jsonapi.WriteError(w, apiErr)

		return
	}

	w.WriteHeader(http.StatusNoContent)
}
