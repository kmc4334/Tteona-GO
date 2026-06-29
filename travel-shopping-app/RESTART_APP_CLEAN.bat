@echo off
echo ================================
echo 앱 재시작 (캐시 클리어)
echo ================================
cd /d "%~dp0"

echo.
echo [1/2] Metro bundler 캐시 초기화 중...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo .expo 폴더 삭제 완료!
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo node_modules\.cache 폴더 삭제 완료!
)

echo.
echo [2/2] Expo 시작 (캐시 클리어)...
echo.
npx expo start --clear

pause
