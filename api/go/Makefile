.PHONY: run test vet fmt check migrate-up migrate-down

run:
	go run ./cmd/server

test:
	go test ./...

vet:
	go vet ./...

fmt:
	gofmt -w .

check: fmt vet test

migrate-up:
	go run ./cmd/migrate up

migrate-down:
	go run ./cmd/migrate down
