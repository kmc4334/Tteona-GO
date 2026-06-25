@echo off
REM Build script for ttaerago-ai

echo Building ttaerago-ai...
go mod tidy
go build -o bin/ttaerago-ai.exe ./cmd/server

if %ERRORLEVEL% EQU 0 (
    echo Build successful! Run: .\bin\ttaerago-ai.exe
) else (
    echo Build failed!
    exit /b 1
)
