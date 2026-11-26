package middleware

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/heyhusen/playground/api/go/internal/domain"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/id"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/jsonapi"
	"github.com/heyhusen/playground/api/go/internal/message"
)

type contextKey int

const (
	keyRequestInfo contextKey = iota
	keyID
	keyPage
	keyCreate
	keyUpdate
)

const (
	maxBodySize     = 1 << 20
	detailsCapacity = 2
)

// CreatePayload is the validated body of POST /users.
type CreatePayload struct {
	ID        string
	FirstName string
	LastName  *string
	Nickname  *string
	Email     string
}

// UpdatePayload is the validated body of PATCH /users/{id} and PUT /users.
type UpdatePayload struct {
	ID         string
	Attributes map[string]any
	Version    *int64
}

// Page is the validated pagination query.
type Page struct {
	Number int
	Size   int
}

// RequestInfo returns the timezone defaults on the request context.
func RequestInfo(r *http.Request) usecase.RequestInfo {
	value, _ := r.Context().Value(keyRequestInfo).(usecase.RequestInfo)

	return value
}

// ID returns the validated id on the request context.
func ID(r *http.Request) string {
	value, _ := r.Context().Value(keyID).(string)

	return value
}

// PageQuery returns the validated page on the request context.
func PageQuery(r *http.Request) Page {
	value, _ := r.Context().Value(keyPage).(Page)

	return value
}

// CreateBody returns the validated create payload.
func CreateBody(r *http.Request) CreatePayload {
	value, _ := r.Context().Value(keyCreate).(CreatePayload)

	return value
}

// UpdateBody returns the validated update payload.
func UpdateBody(r *http.Request) UpdatePayload {
	value, _ := r.Context().Value(keyUpdate).(UpdatePayload)

	return value
}

// Recover turns panics into the same JSON:API 500 document as Node's
// globalErrorHandler.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if value := recover(); value != nil {
				jsonapi.WriteInternal(w)
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// DefaultRequest injects timezone defaults, mirroring api/node's middleware.
func DefaultRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := r.Header.Get("Timezone-Name")
		if name == "" {
			name = "Asia/Jakarta"
		}

		offset := r.Header.Get("Timezone-Offset")
		if offset == "" {
			offset = "7"
		}

		parsedOffset, err := strconv.Atoi(offset)
		if err != nil {
			parsedOffset = 7
		}

		r.Header.Set("Timezone-Name", name)
		r.Header.Set("Timezone-Offset", strconv.Itoa(parsedOffset))

		info := usecase.RequestInfo{TimezoneName: name, TimezoneOffset: parsedOffset}
		ctx := context.WithValue(r.Context(), keyRequestInfo, info)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ValidateID checks the :id route parameter.
func ValidateID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		value := chi.URLParam(r, "id")
		if !id.IsValid(value) {
			jsonapi.WriteError(w, domain.NewValidationError(message.IDFormat))

			return
		}

		ctx := context.WithValue(r.Context(), keyID, value)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// parseQuery restores the bracket notation used by the Node servers:
// page[number]=1 -> {"page": {"number": "1"}}.
func parseQuery(raw string) map[string]any {
	result := map[string]any{}

	values, err := url.ParseQuery(raw)
	if err != nil {
		return result
	}

	for key, list := range values {
		segments := regexp.MustCompile(`[^\[\]]+`).FindAllString(key, -1)
		if len(segments) == 0 {
			continue
		}

		target := result

		for index, segment := range segments {
			if index == len(segments)-1 {
				target[segment] = list[0]

				continue
			}

			nested, ok := target[segment].(map[string]any)
			if !ok {
				nested = map[string]any{}
				target[segment] = nested
			}

			target = nested
		}
	}

	return result
}

// ValidateQuery checks page[number] and page[size].
func ValidateQuery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query := parseQuery(r.URL.RawQuery)
		pageValue, ok := query["page"]

		if !ok {
			jsonapi.WriteError(w, domain.NewValidationError(message.PageRequired))

			return
		}

		pageMap, ok := pageValue.(map[string]any)
		if !ok {
			jsonapi.WriteError(w, domain.NewValidationError(message.PageType))

			return
		}

		details := make([]string, 0, detailsCapacity)

		number, ok := parsePageValue(pageMap["number"], message.PageNumberRequired, message.PageNumberType, &details)
		if !ok {
			number = 0
		}

		size, ok := parsePageValue(pageMap["size"], message.PageSizeRequired, message.PageSizeType, &details)
		if !ok {
			size = 0
		}

		if len(details) > 0 {
			jsonapi.WriteError(w, domain.NewValidationError(details...))

			return
		}

		ctx := context.WithValue(r.Context(), keyPage, Page{Number: number, Size: size})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func parsePageValue(value any, required, wrongType string, details *[]string) (int, bool) {
	str, ok := value.(string)
	if !ok {
		*details = append(*details, required)

		return 0, false
	}

	parsed, err := strconv.Atoi(str)
	if err != nil {
		*details = append(*details, wrongType)

		return 0, false
	}

	return parsed, true
}

func decodeBody(r *http.Request) (map[string]any, []string) {
	body, err := io.ReadAll(io.LimitReader(r.Body, maxBodySize))
	if err != nil || len(body) == 0 {
		return nil, []string{message.BodyRequired}
	}

	var payload map[string]any
	if decodeErr := json.Unmarshal(body, &payload); decodeErr != nil {
		return nil, []string{message.BodyRequired}
	}

	return payload, nil
}

func dataObject(body map[string]any) (map[string]any, []string) {
	value, ok := body["data"]
	if !ok {
		return nil, []string{message.DataRequired}
	}

	data, ok := value.(map[string]any)
	if !ok {
		return nil, []string{message.DataRequired}
	}

	return data, nil
}

func validateType(data map[string]any, details *[]string) {
	value, ok := data["type"].(string)
	if !ok {
		*details = append(*details, message.DataTypeRequired)

		return
	}

	if value != "users" {
		*details = append(*details, message.DataTypePattern)
	}
}

var emailPattern = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func stringPointer(value any) *string {
	str, ok := value.(string)
	if !ok {
		return nil
	}

	return &str
}

func stringValue(value any) string {
	str, _ := value.(string)

	return str
}

func validateFirstName(attributes map[string]any, details *[]string) {
	value, exists := attributes["first_name"]
	if !exists {
		return
	}

	str, ok := value.(string)
	if !ok {
		*details = append(*details, message.FirstNameType)

		return
	}

	if str == "" {
		*details = append(*details, message.FirstNameMinLength)
	}
}

func validateEmail(attributes map[string]any, details *[]string, compat bool) {
	value, exists := attributes["email"]
	if !exists {
		return
	}

	str, ok := value.(string)
	if !ok {
		if compat {
			*details = append(*details, message.EmailType)
		} else {
			*details = append(*details, message.EmailFormat)
		}

		return
	}

	if str == "" {
		*details = append(*details, message.EmailFormat, message.EmailRequired)

		return
	}

	if !emailPattern.MatchString(str) {
		*details = append(*details, message.EmailFormat)
	}
}

// versionOf extracts the optional optimistic-concurrency token. Invalid
// values are reported as validation errors; absence means no version guard.
func versionOf(attributes map[string]any, details *[]string) *int64 {
	value, exists := attributes["version"]
	if !exists {
		return nil
	}

	number, ok := value.(float64)
	if !ok || number <= 0 || float64(int64(number)) != number {
		*details = append(*details, message.VersionType)

		return nil
	}

	version := int64(number)

	return &version
}

func attributesOf(data map[string]any) map[string]any {
	attributes, ok := data["attributes"].(map[string]any)
	if !ok {
		return map[string]any{}
	}

	return attributes
}

// ValidateCreate validates POST /users bodies.
func ValidateCreate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, details := decodeBody(r)
		if len(details) > 0 {
			jsonapi.WriteError(w, domain.NewValidationError(details...))

			return
		}

		data, details := dataObject(body)
		if len(details) > 0 {
			jsonapi.WriteError(w, domain.NewValidationError(details...))

			return
		}

		details = []string{}
		validateType(data, &details)

		attributes := attributesOf(data)
		if _, ok := attributes["first_name"]; !ok {
			details = append(details, message.FirstNameRequired)
		}
		validateFirstName(attributes, &details)
		validateEmail(attributes, &details, false)

		if len(details) > 0 {
			jsonapi.WriteError(w, domain.NewValidationError(details...))

			return
		}

		userID, _ := data["id"].(string)
		if userID != "" && !id.IsValid(userID) {
			jsonapi.WriteError(w, domain.NewValidationError(message.DataIDFormat))

			return
		}

		payload := CreatePayload{
			ID:        userID,
			FirstName: stringValue(attributes["first_name"]),
			LastName:  stringPointer(attributes["last_name"]),
			Nickname:  stringPointer(attributes["nickname"]),
			Email:     stringValue(attributes["email"]),
		}

		ctx := context.WithValue(r.Context(), keyCreate, payload)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type updateInput struct {
	id         string
	attributes map[string]any
	version    *int64
}

func parseUpdate(data map[string]any, compat bool, details *[]string) updateInput {
	idValue := ""
	if compat {
		value, ok := data["id"].(string)
		switch {
		case !ok:
			*details = append(*details, message.DataIDRequired)
		case !id.IsValid(value):
			*details = append(*details, message.DataIDFormat)
		default:
			idValue = value
		}
	}

	validateType(data, details)

	attributes := attributesOf(data)
	validateFirstName(attributes, details)
	validateEmail(attributes, details, compat)

	return updateInput{
		id:         idValue,
		attributes: attributes,
		version:    versionOf(attributes, details),
	}
}

func updateMiddleware(compat bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, details := decodeBody(r)

			if len(details) > 0 {
				// PATCH's body is optional; an empty body is a no-op update.
				if compat {
					jsonapi.WriteError(w, domain.NewValidationError(details...))

					return
				}

				ctx := context.WithValue(r.Context(), keyUpdate, UpdatePayload{
					ID:         ID(r),
					Attributes: map[string]any{},
				})
				next.ServeHTTP(w, r.WithContext(ctx))

				return
			}

			data, details := dataObject(body)
			if len(details) > 0 {
				jsonapi.WriteError(w, domain.NewValidationError(details...))

				return
			}

			parsed := parseUpdate(data, compat, &details)
			if len(details) > 0 {
				jsonapi.WriteError(w, domain.NewValidationError(details...))

				return
			}

			userID := ID(r)
			if compat {
				userID = parsed.id
			}

			payload := UpdatePayload{ID: userID, Attributes: parsed.attributes, Version: parsed.version}
			ctx := context.WithValue(r.Context(), keyUpdate, payload)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// ValidatePatch validates PATCH /users/{id} bodies.
func ValidatePatch(next http.Handler) http.Handler {
	return updateMiddleware(false)(next)
}

// ValidatePut validates PUT /users bodies (compatibility update).
func ValidatePut(next http.Handler) http.Handler {
	return updateMiddleware(true)(next)
}
