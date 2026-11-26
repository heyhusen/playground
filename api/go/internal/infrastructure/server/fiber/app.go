package fiber

import (
	"net/http"

	fiberserver "github.com/gofiber/fiber/v3"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/fiber/handler"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/fiber/middleware"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/openapi"
)

// New builds the Fiber router with the same routes as the other servers.
func New(cfg config.Config, service *usecase.Service, doc *openapi.Document) *fiberserver.App {
	app := fiberserver.New(fiberserver.Config{
		ErrorHandler: middleware.ErrorHandler,
	})

	app.Use(middleware.DefaultRequest)

	app.Get("/", handler.Home)

	if doc != nil {
		app.Get("/docs", func(c fiberserver.Ctx) error {
			c.Set("Content-Type", "text/html; charset=utf-8")

			return c.Send([]byte(doc.HTML()))
		})
		app.Get("/docs/openapi.yaml", func(c fiberserver.Ctx) error {
			c.Set("Content-Type", "application/yaml")

			return c.Send(doc.YAML)
		})
	}

	users := &handler.User{Service: service, BaseURL: cfg.AppURL}

	app.Get("/users", middleware.ValidateQuery, users.ReadAll)
	app.Post("/users", middleware.ValidateCreate, users.Create)
	app.Get("/users/:id", middleware.ValidateID, users.Read)
	app.Patch("/users/:id", middleware.ValidateID, middleware.ValidatePatch, users.Update)
	app.Put("/users", middleware.ValidatePut, users.Update)
	app.Delete("/users/:id", middleware.ValidateID, users.Delete)

	app.Use(func(_ fiberserver.Ctx) error {
		return domain.NewError(http.StatusNotFound, "Not Found", "Not Found")
	})

	return app
}
