.PHONY: run run-chi run-echo run-fiber dev dev-chi dev-echo dev-fiber test vet fmt check migrate-up migrate-down

run: run-chi

run-chi:
	go run ./cmd/server

run-echo:
	go run ./cmd/server-echo

run-fiber:
	go run ./cmd/server-fiber

# Hot reload via Air (https://github.com/air-verse/air).
dev: dev-chi

dev-chi:
	air -c .air.toml

dev-echo:
	air -c .air.toml --build.cmd "go build -o ./tmp/main ./cmd/server-echo"

dev-fiber:
	air -c .air.toml --build.cmd "go build -o ./tmp/main ./cmd/server-fiber"

# All server suites share one database, so their packages run serially.
test:
	go test -p 1 ./...

vet:
	golangci-lint run

fmt:
	golangci-lint fmt

check: fmt vet test

migrate-up:
	go run ./cmd/migrate up

migrate-down:
	go run ./cmd/migrate down
