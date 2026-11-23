.PHONY: run run-chi run-echo test vet fmt check migrate-up migrate-down

run: run-chi

run-chi:
	go run ./cmd/server

run-echo:
	go run ./cmd/server-echo

# Both server suites share one database, so their packages run serially.
test:
	go test -p 1 ./...

vet:
	go vet ./...

fmt:
	gofmt -w .

check: fmt vet test

migrate-up:
	go run ./cmd/migrate up

migrate-down:
	go run ./cmd/migrate down
