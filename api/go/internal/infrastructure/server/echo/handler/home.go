package handler

import (
	"encoding/json"
	"net/http"

	echov4 "github.com/labstack/echo/v4"
)

// Home returns the same payload as api/node's HomeController.
func Home(c echov4.Context) error {
	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().WriteHeader(http.StatusOK)

	return json.NewEncoder(c.Response().Writer).Encode("Hello world!")
}
