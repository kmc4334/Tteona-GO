#!/bin/bash
# Build script for ttaerago-ai

echo "Building ttaerago-ai..."
go mod tidy
go build -o bin/ttaerago-ai ./cmd/server

if [ $? -eq 0 ]; then
    echo "Build successful! Run: ./bin/ttaerago-ai"
else
    echo "Build failed!"
    exit 1
fi
