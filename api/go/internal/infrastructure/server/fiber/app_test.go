package fiber

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestHome(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodGet, "/", nil)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var data string
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if data != "Hello world!" {
		t.Fatalf("unexpected body: %q", data)
	}
}

func TestNotFound(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodGet, "/404", nil)

	assertError(t, resp, http.StatusNotFound, "Not Found")
}

func TestDocs(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodGet, "/docs", nil)
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if resp.StatusCode != http.StatusOK || !strings.Contains(string(body), "SwaggerUIBundle") {
		t.Fatalf("unexpected docs response: %d %s", resp.StatusCode, body)
	}
}

func TestOpenAPIYAML(t *testing.T) {
	server, _ := setup(t)

	resp := request(t, server, http.MethodGet, "/docs/openapi.yaml", nil)
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if resp.StatusCode != http.StatusOK || !strings.Contains(string(body), "openapi:") {
		t.Fatalf("unexpected spec response: %d", resp.StatusCode)
	}
}
