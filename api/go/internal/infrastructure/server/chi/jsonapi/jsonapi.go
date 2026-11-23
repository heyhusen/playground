package jsonapi

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/heyhusen/playground/api/go/internal/domain"
)

const version = "1.1"

type apiVersion struct {
	Version string `json:"version"`
}

// Document is a JSON:API success document.
type Document struct {
	JSONAPI apiVersion     `json:"jsonapi"`
	Data    any            `json:"data"`
	Links   map[string]any `json:"links,omitempty"`
	Meta    map[string]any `json:"meta,omitempty"`
}

// ErrorItem is one JSON:API error object.
type ErrorItem struct {
	Status string `json:"status"`
	Title  string `json:"title"`
	Detail string `json:"detail"`
}

// ErrorDocument is a JSON:API error document.
type ErrorDocument struct {
	JSONAPI apiVersion  `json:"jsonapi"`
	Errors  []ErrorItem `json:"errors"`
}

// UserAttributes is the serialized attribute set of a user.
type UserAttributes struct {
	FirstName string  `json:"first_name"`
	LastName  *string `json:"last_name"`
	Nickname  *string `json:"nickname"`
	Email     string  `json:"email"`
	CreatedAt int64   `json:"created_at"`
	UpdatedAt int64   `json:"updated_at"`
}

// Resource is a JSON:API resource object for a user.
type Resource struct {
	ID         string            `json:"id"`
	Type       string            `json:"type"`
	Attributes UserAttributes    `json:"attributes"`
	Links      map[string]string `json:"links,omitempty"`
}

// WriteData serializes data as a JSON:API document.
func WriteData(w http.ResponseWriter, status int, data any, links map[string]any, meta map[string]any) {
	w.Header().Set("Content-Type", "application/vnd.api+json")
	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(Document{
		JSONAPI: apiVersion{Version: version},
		Data:    data,
		Links:   links,
		Meta:    meta,
	})
}

// WriteError serializes a domain error as a JSON:API error document.
func WriteError(w http.ResponseWriter, err *domain.Error) {
	details := err.Details
	if len(details) == 0 {
		details = []string{err.Detail}
	}

	items := make([]ErrorItem, 0, len(details))
	for _, detail := range details {
		items = append(items, ErrorItem{
			Status: strconv.Itoa(err.Status),
			Title:  err.Title,
			Detail: detail,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.Status)

	_ = json.NewEncoder(w).Encode(ErrorDocument{
		JSONAPI: apiVersion{Version: version},
		Errors:  items,
	})
}

// WriteNotFound writes the framework's 404 error document.
func WriteNotFound(w http.ResponseWriter) {
	WriteError(w, domain.NewError(http.StatusNotFound, "Not Found", "Not Found"))
}

// WriteInternal writes the framework's generic 500 error document.
func WriteInternal(w http.ResponseWriter) {
	WriteError(w, domain.NewError(http.StatusInternalServerError, "Error", "Internal Server Error"))
}
