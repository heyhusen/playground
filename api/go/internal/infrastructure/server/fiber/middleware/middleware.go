package middleware

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"

	"github.com/gofiber/fiber/v3"

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
	Version    *int64
}

// Page is the validated pagination query.
type Page struct {
	Number int
	Size   int
}

// RequestInfo returns the timezone defaults from the context.
func RequestInfo(c fiber.Ctx) usecase.RequestInfo {
	value, _ := c.Locals(keyRequestInfo).(usecase.RequestInfo)

	return value
}

// ID returns the validated id from the context.
func ID(c fiber.Ctx) string {
	value, _ := c.Locals(keyID).(string)

	return value
}

// PageQuery returns the validated page from the context.
func PageQuery(c fiber.Ctx) Page {
	value, _ := c.Locals(keyPage).(Page)

	return value
}

// CreateBody returns the validated create payload.
func CreateBody(c fiber.Ctx) CreatePayload {
	value, _ := c.Locals(keyCreate).(CreatePayload)

	return value
}

// UpdateBody returns the validated update payload.
func UpdateBody(c fiber.Ctx) UpdatePayload {
	value, _ := c.Locals(keyUpdate).(UpdatePayload)

	return value
}

// ErrorHandler maps domain and Fiber errors to JSON:API documents.
func ErrorHandler(c fiber.Ctx, err error) error {
	if apiErr, ok := errors.AsType[*domain.Error](err); ok {
		c.Set("Content-Type", "application/json")

		return c.Status(apiErr.Status).Send(jsonapi.MarshalError(apiErr))
	}

	if fiberErr, ok := errors.AsType[*fiber.Error](err); ok {
		detail := fiberErr.Message
		if detail == "" {
			detail = http.StatusText(fiberErr.Code)
		}

		c.Set("Content-Type", "application/json")

		return c.Status(fiberErr.Code).Send(jsonapi.MarshalError(
			domain.NewError(fiberErr.Code, detail, detail),
		))
	}

	c.Set("Content-Type", "application/json")

	return c.Status(http.StatusInternalServerError).Send(jsonapi.MarshalError(
		domain.NewError(http.StatusInternalServerError, "Error", "Internal Server Error"),
	))
}

// DefaultRequest injects timezone defaults, mirroring api/node's middleware.
func DefaultRequest(c fiber.Ctx) error {
	name := string(c.Request().Header.Peek("Timezone-Name"))
	if name == "" {
		name = "Asia/Jakarta"
	}

	offset := string(c.Request().Header.Peek("Timezone-Offset"))
	if offset == "" {
		offset = "7"
	}

	parsedOffset, err := strconv.Atoi(offset)
	if err != nil {
		parsedOffset = 7
	}

	c.Request().Header.Set("Timezone-Name", name)
	c.Request().Header.Set("Timezone-Offset", strconv.Itoa(parsedOffset))
	c.Locals(keyRequestInfo, usecase.RequestInfo{
		TimezoneName:   name,
		TimezoneOffset: parsedOffset,
	})

	return c.Next()
}

// ValidateID checks the :id route parameter.
func ValidateID(c fiber.Ctx) error {
	value := c.Params("id")
	if !id.IsValid(value) {
		return domain.NewValidationError(message.IDFormat)
	}

	c.Locals(keyID, value)

	return c.Next()
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
func ValidateQuery(c fiber.Ctx) error {
	query := parseQuery(string(c.Request().URI().QueryString()))
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

	c.Locals(keyPage, Page{Number: number, Size: size})

	return c.Next()
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

func decodeBody(c fiber.Ctx) (map[string]any, []string) {
	body := c.Request().Body()
	if len(body) == 0 {
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
func ValidateCreate(c fiber.Ctx) error {
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

	c.Locals(keyCreate, CreatePayload{
		ID:        userID,
		FirstName: stringValue(attributes["first_name"]),
		LastName:  stringPointer(attributes["last_name"]),
		Nickname:  stringPointer(attributes["nickname"]),
		Email:     stringValue(attributes["email"]),
	})

	return c.Next()
}

func updateMiddleware(compat bool) fiber.Handler {
	return func(c fiber.Ctx) error {
		body, details := decodeBody(c)

		if len(details) > 0 {
			if compat {
				return domain.NewValidationError(details...)
			}

			c.Locals(keyUpdate, UpdatePayload{ID: ID(c), Attributes: map[string]any{}})

			return c.Next()
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
		version := versionOf(attributes, &details)

		if len(details) > 0 {
			return domain.NewValidationError(details...)
		}

		userID := ID(c)
		if compat {
			userID, _ = data["id"].(string)
		}

		c.Locals(keyUpdate, UpdatePayload{ID: userID, Attributes: attributes, Version: version})

		return c.Next()
	}
}

// ValidatePatch validates PATCH /users/{id} bodies.
func ValidatePatch(c fiber.Ctx) error {
	return updateMiddleware(false)(c)
}

// ValidatePut validates PUT /users bodies (compatibility update).
func ValidatePut(c fiber.Ctx) error {
	return updateMiddleware(true)(c)
}
