package handler

import (
	"encoding/json"
	"net/http"
)

// Home returns the same payload as api/node's HomeController.
func Home(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode("Hello world!")
}
