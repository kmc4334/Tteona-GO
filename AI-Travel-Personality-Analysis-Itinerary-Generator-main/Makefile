.PHONY: build run test clean help

BIN_NAME=ttaerago-ai

help:
	@echo "Available commands:"
	@echo "  make build      - Build the project"
	@echo "  make run        - Build and run the project"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make tidy       - Tidy Go modules"

build:
	@echo "Building $(BIN_NAME)..."
	@mkdir -p bin
	@go build -o bin/$(BIN_NAME) ./cmd/server
	@echo "Build complete: bin/$(BIN_NAME)"

run: build
	@echo "Running $(BIN_NAME)..."
	@./bin/$(BIN_NAME)

test:
	@echo "Running tests..."
	@go test -v ./...

clean:
	@echo "Cleaning..."
	@rm -rf bin dist
	@go clean

tidy:
	@echo "Tidying modules..."
	@go mod tidy

format:
	@echo "Formatting code..."
	@go fmt ./...

lint:
	@echo "Linting code..."
	@go vet ./...
