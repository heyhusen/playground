package handler

import (
	"fmt"
	"net/http"

	echov4 "github.com/labstack/echo/v4"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/echo/middleware"
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
func (h *User) Create(c echov4.Context) error {
	body := middleware.CreateBody(c)

	user, apiErr := h.Service.Create(c.Request().Context(), usecase.CreateInput{
		RequestInfo: middleware.RequestInfo(c),
		ID:          body.ID,
		Attributes: entity.BaseUserEntity{
			FirstName: body.FirstName,
			LastName:  body.LastName,
			Nickname:  body.Nickname,
			Email:     body.Email,
		},
		IdempotencyKey: c.Request().Header.Get("Idempotency-Key"),
		Fingerprint:    idem.Fingerprint(body),
	})
	if apiErr != nil {
		return apiErr
	}

	jsonapi.WriteData(c.Response().Writer, http.StatusCreated, resource(user, h.BaseURL), nil, nil)

	return nil
}

// Read handles GET /users/{id}.
func (h *User) Read(c echov4.Context) error {
	user, apiErr := h.Service.Read(c.Request().Context(), middleware.ID(c))
	if apiErr != nil {
		return apiErr
	}

	jsonapi.WriteData(c.Response().Writer, http.StatusOK, resource(user, h.BaseURL), nil, nil)

	return nil
}

// ReadAll handles GET /users.
func (h *User) ReadAll(c echov4.Context) error {
	page := middleware.PageQuery(c)

	users, total, apiErr := h.Service.ReadAll(c.Request().Context(), page.Number, page.Size)
	if apiErr != nil {
		return apiErr
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

	jsonapi.WriteData(c.Response().Writer, http.StatusOK, data, links, nil)

	return nil
}

// Update handles PATCH /users/{id} and PUT /users.
func (h *User) Update(c echov4.Context) error {
	body := middleware.UpdateBody(c)

	user, apiErr := h.Service.Update(c.Request().Context(), usecase.UpdateInput{
		RequestInfo:     middleware.RequestInfo(c),
		ID:              body.ID,
		Attributes:      body.Attributes,
		ExpectedVersion: body.Version,
		IdempotencyKey:  c.Request().Header.Get("Idempotency-Key"),
		Fingerprint:     idem.Fingerprint(body.Attributes),
	})
	if apiErr != nil {
		return apiErr
	}

	jsonapi.WriteData(c.Response().Writer, http.StatusOK, resource(user, h.BaseURL), nil, nil)

	return nil
}

// Delete handles DELETE /users/{id}.
func (h *User) Delete(c echov4.Context) error {
	if apiErr := h.Service.Delete(c.Request().Context(), middleware.ID(c)); apiErr != nil {
		return apiErr
	}

	c.Response().WriteHeader(http.StatusNoContent)

	return nil
}
