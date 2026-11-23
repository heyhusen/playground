package echo

import (
	echov4 "github.com/labstack/echo/v4"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/echo/handler"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/echo/middleware"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/openapi"
)

// New builds the Echo router with the same routes as the other servers.
func New(cfg config.Config, service *usecase.Service, doc *openapi.Document) *echov4.Echo {
	e := echov4.New()
	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.DefaultRequest)
	e.HTTPErrorHandler = middleware.ErrorHandler

	e.GET("/", handler.Home)

	if doc != nil {
		e.GET("/docs", func(c echov4.Context) error {
			doc.Docs(c.Response().Writer, c.Request())

			return nil
		})
		e.GET("/docs/openapi.yaml", func(c echov4.Context) error {
			doc.YAMLHandler(c.Response().Writer, c.Request())

			return nil
		})
	}

	users := &handler.User{Service: service, BaseURL: cfg.AppURL}

	e.GET("/users", users.ReadAll, middleware.ValidateQuery)
	e.POST("/users", users.Create, middleware.ValidateCreate)
	e.GET("/users/:id", users.Read, middleware.ValidateID)
	e.PATCH("/users/:id", users.Update, middleware.ValidateID, middleware.ValidatePatch)
	e.PUT("/users", users.Update, middleware.ValidatePut)
	e.DELETE("/users/:id", users.Delete, middleware.ValidateID)

	return e
}
