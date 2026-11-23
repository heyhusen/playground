package handler

import (
	"net/http"

	"github.com/gofiber/fiber/v3"
)

// Home returns the same payload as api/node's HomeController.
func Home(c fiber.Ctx) error {
	c.Set("Content-Type", "application/json")

	return c.Status(http.StatusOK).Send([]byte("\"Hello world!\"\n"))
}
