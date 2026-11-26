package chi

import (
	"net/http"
	"slices"

	chirouter "github.com/go-chi/chi/v5"

	"github.com/heyhusen/playground/api/go/internal/config"
	"github.com/heyhusen/playground/api/go/internal/domain/usecase"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/chi/handler"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/chi/middleware"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/jsonapi"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/server/shared/openapi"
)

// New builds the chi router with the same routes as the Node servers.
func New(cfg config.Config, service *usecase.Service, doc *openapi.Document) http.Handler {
	router := chirouter.NewRouter()

	router.Use(middleware.DefaultRequest)
	router.Use(middleware.Recover)

	router.NotFound(func(w http.ResponseWriter, _ *http.Request) {
		jsonapi.WriteNotFound(w)
	})

	router.Get("/", handler.Home)

	if doc != nil {
		router.Get("/docs", doc.Docs)
		router.Get("/docs/openapi.yaml", doc.YAMLHandler)
	}

	users := &handler.User{Service: service, BaseURL: cfg.AppURL}

	router.Route("/users", func(r chirouter.Router) {
		r.Get("/", chain(users.ReadAll, middleware.ValidateQuery))
		r.Post("/", chain(users.Create, middleware.ValidateCreate))
		r.Get("/{id}", chain(users.Read, middleware.ValidateID))
		r.Patch("/{id}", chain(users.Update, middleware.ValidateID, middleware.ValidatePatch))
		r.Put("/", chain(users.Update, middleware.ValidatePut))
		r.Delete("/{id}", chain(users.Delete, middleware.ValidateID))
	})

	return router
}

func chain(handler http.HandlerFunc, middlewares ...func(http.Handler) http.Handler) http.HandlerFunc {
	var next http.Handler = handler

	for _, middleware := range slices.Backward(middlewares) {
		next = middleware(next)
	}

	return next.ServeHTTP
}
