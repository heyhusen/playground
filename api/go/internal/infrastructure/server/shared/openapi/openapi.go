package openapi

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"

	spec "github.com/speakeasy-api/openapi/openapi"
)

// Document holds the parsed specification and its raw YAML source.
type Document struct {
	Spec *spec.OpenAPI
	YAML []byte
}

// resolvePath looks upward for the spec so tests (whose working directory is
// the package folder) and the running server both find the repo-root file.
func resolvePath(path string) string {
	if filepath.IsAbs(path) {
		return path
	}

	dir, err := os.Getwd()
	if err != nil {
		return path
	}

	for i := 0; i < 8; i++ {
		candidate := filepath.Join(dir, path)
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	return path
}

// Load parses openapi.yaml with speakeasy-api/openapi.
func Load(path string) (*Document, error) {
	path = resolvePath(path)

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	doc, warnings, err := spec.Unmarshal(context.Background(), file)
	if err != nil {
		return nil, err
	}

	for _, warning := range warnings {
		slog.Warn("openapi validation", "detail", warning.Error())
	}

	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return &Document{Spec: doc, YAML: raw}, nil
}

// Docs serves a Swagger UI page pointing at the local spec.
func (d *Document) Docs(w http.ResponseWriter, _ *http.Request) {
	title := "API Documentation"
	if d.Spec != nil && d.Spec.Info.Title != "" {
		title = d.Spec.Info.Title
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	_, _ = fmt.Fprintf(w, `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>%s</title>
		<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
	</head>
	<body>
		<div id="swagger-ui"></div>
		<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
		<script>
			window.onload = () => {
				SwaggerUIBundle({ url: '/docs/openapi.yaml', dom_id: '#swagger-ui' });
			};
		</script>
	</body>
</html>`, title)
}

// YAML serves the raw OpenAPI document.
func (d *Document) YAMLHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/yaml")

	_, _ = w.Write(d.YAML)
}
