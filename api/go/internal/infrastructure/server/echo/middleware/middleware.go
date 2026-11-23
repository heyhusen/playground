package middleware

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"

	echov4 "github.com/labstack/echo/v4"

	"github.com/heyhusen/playground/api/go/internal/domain"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/id"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/jsonapi"
	"github.com/heyhusen/playground/api/go/internal/message"
)

const (
	keyRequestInfo = "request_info"
	keyID          = "id"
	keyPage        = "page"
	keyCreate      = "create"
	keyUpdate      = "update"
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
}

// Page is the validated pagination query.
type Page struct {
	Number int
	Size   int
}

// RequestInfo returns the timezone defaults from the context.
func RequestInfo(c echov4.Context) usecase.RequestInfo {
	value, _ := c.Get(keyRequestInfo).(usecase.RequestInfo)

	return value
}

// ID returns the validated id from the context.
func ID(c echov4.Context) string {
	value, _ := c.Get(keyID).(string)

	return value
}

// PageQuery returns the validated page from the context.
func PageQuery(c echov4.Context) Page {
	value, _ := c.Get(keyPage).(Page)

	return value
}

// CreateBody returns the validated create payload.
func CreateBody(c echov4.Context) CreatePayload {
	value, _ := c.Get(keyCreate).(CreatePayload)

	return value
}

// UpdateBody returns the validated update payload.
func UpdateBody(c echov4.Context) UpdatePayload {
	value, _ := c.Get(keyUpdate).(UpdatePayload)

	return value
}

// ErrorHandler maps domain errors to JSON:API documents.
func ErrorHandler(err error, c echov4.Context) {
	var apiErr *domain.Error
	if errors.As(err, &apiErr) {
		jsonapi.WriteError(c.Response().Writer, apiErr)

		return
	}

	var httpErr *echov4.HTTPError
	if errors.As(err, &httpErr) {
		message := http.StatusText(httpErr.Code)
		if text, ok := httpErr.Message.(string); ok && text != "" {
			message = text
		}

		jsonapi.WriteError(c.Response().Writer, domain.NewError(httpErr.Code, message, message))

		return
	}

	jsonapi.WriteInternal(c.Response().Writer)
}

// DefaultRequest injects timezone defaults, mirroring api/node's middleware.
func DefaultRequest(next echov4.HandlerFunc) echov4.HandlerFunc {
	return func(c echov4.Context) error {
		name := c.Request().Header.Get("Timezone-Name")
		if name == "" {
			name = "Asia/Jakarta"
		}

		offset := c.Request().Header.Get("Timezone-Offset")
		if offset == "" {
			offset = "7"
		}

		parsedOffset, err := strconv.Atoi(offset)
		if err != nil {
			parsedOffset = 7
		}

		c.Request().Header.Set("Timezone-Name", name)
		c.Request().Header.Set("Timezone-Offset", strconv.Itoa(parsedOffset))
		c.Set(keyRequestInfo, usecase.RequestInfo{
			TimezoneName:   name,
			TimezoneOffset: parsedOffset,
		})

		return next(c)
	}
}

// ValidateID checks the :id route parameter.
func ValidateID(next echov4.HandlerFunc) echov4.HandlerFunc {
	return func(c echov4.Context) error {
		value := c.Param("id")
		if !id.IsValid(value) {
			return domain.NewValidationError(message.IDFormat)
		}

		c.Set(keyID, value)

		return next(c)
	}
}

var bracketPattern = regexp.MustCompile(`[^\[\]]+`)

// parseQuery restores `page[number]=1` into a nested map.
func parseQuery(raw string) map[string]any {
	result := map[string]any{}

	values, err := url.ParseQuery(raw)
	if err != nil {
		return result
	}

	for key, list := range values {
		segments := bracketPattern.FindAllString(key, -1)
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
func ValidateQuery(next echov4.HandlerFunc) echov4.HandlerFunc {
	return func(c echov4.Context) error {
		query := parseQuery(c.Request().URL.RawQuery)
		pageValue, ok := query["page"]
		if !ok {
			return domain.NewValidationError(message.PageRequired)
		}

		pageMap, ok := pageValue.(map[string]any)
		if !ok {
			return domain.NewValidationError(message.PageType)
		}

		details := []string{}

		number, ok := parsePageValue(pageMap["number"], message.PageNumberRequired, message.PageNumberType, &details)
		if !ok {
			number = 0
		}

		size, ok := parsePageValue(pageMap["size"], message.PageSizeRequired, message.PageSizeType, &details)
		if !ok {
			size = 0
		}

		if len(details) > 0 {
			return domain.NewValidationError(details...)
		}

		c.Set(keyPage, Page{Number: number, Size: size})

		return next(c)
	}
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

func decodeBody(c echov4.Context) (map[string]any, []string) {
	body, err := io.ReadAll(io.LimitReader(c.Request().Body, 1<<20))
	if err != nil || len(body) == 0 {
		return nil, []string{message.BodyRequired}
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
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

func attributesOf(data map[string]any) map[string]any {
	attributes, ok := data["attributes"].(map[string]any)
	if !ok {
		return map[string]any{}
	}

	return attributes
}

// ValidateCreate validates POST /users bodies.
func ValidateCreate(next echov4.HandlerFunc) echov4.HandlerFunc {
	return func(c echov4.Context) error {
		body, details := decodeBody(c)
		if len(details) > 0 {
			return domain.NewValidationError(details...)
		}

		data, details := dataObject(body)
		if len(details) > 0 {
			return domain.NewValidationError(details...)
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
			return domain.NewValidationError(details...)
		}

		userID, _ := data["id"].(string)
		if userID != "" && !id.IsValid(userID) {
			return domain.NewValidationError(message.DataIDFormat)
		}

		c.Set(keyCreate, CreatePayload{
			ID:        userID,
			FirstName: attributes["first_name"].(string),
			LastName:  stringPointer(attributes["last_name"]),
			Nickname:  stringPointer(attributes["nickname"]),
			Email:     attributes["email"].(string),
		})

		return next(c)
	}
}

func updateMiddleware(compat bool) func(echov4.HandlerFunc) echov4.HandlerFunc {
	return func(next echov4.HandlerFunc) echov4.HandlerFunc {
		return func(c echov4.Context) error {
			body, details := decodeBody(c)

			if len(details) > 0 {
				if compat {
					return domain.NewValidationError(details...)
				}

				c.Set(keyUpdate, UpdatePayload{ID: ID(c), Attributes: map[string]any{}})

				return next(c)
			}

			data, details := dataObject(body)
			if len(details) > 0 {
				return domain.NewValidationError(details...)
			}

			details = []string{}

			if compat {
				value, ok := data["id"].(string)
				if !ok {
					details = append(details, message.DataIDRequired)
				} else if !id.IsValid(value) {
					details = append(details, message.DataIDFormat)
				}
			}

			validateType(data, &details)

			attributes := attributesOf(data)
			validateFirstName(attributes, &details)
			validateEmail(attributes, &details, compat)

			if len(details) > 0 {
				return domain.NewValidationError(details...)
			}

			userID := ID(c)
			if compat {
				userID, _ = data["id"].(string)
			}

			c.Set(keyUpdate, UpdatePayload{ID: userID, Attributes: attributes})

			return next(c)
		}
	}
}

// ValidatePatch validates PATCH /users/{id} bodies.
func ValidatePatch(next echov4.HandlerFunc) echov4.HandlerFunc {
	return updateMiddleware(false)(next)
}

// ValidatePut validates PUT /users bodies (compatibility update).
func ValidatePut(next echov4.HandlerFunc) echov4.HandlerFunc {
	return updateMiddleware(true)(next)
}
