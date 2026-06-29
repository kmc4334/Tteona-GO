@echo off
echo ================================
echo Metro Bundler 캐시 정리 중...
echo ================================
cd /d "%~dp0"

echo.
echo [1/4] node_modules/.cache 삭제...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo 완료!
) else (
    echo 캐시 폴더가 없습니다.
)

echo.
echo [2/4] .expo 캐시 삭제...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo 완료!
) else (
    echo .expo 폴더가 없습니다.
)

echo.
echo [3/4] Metro bundler 캐시 초기화...
call npx expo start --clear

echo.
echo ================================
echo 캐시 정리 완료!
echo ================================
pause
