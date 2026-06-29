@echo off
echo ========================================
echo   앱 오류 해결 스크립트
echo ========================================
echo.

echo [1/4] Node 프로세스 종료 중...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/4] 디렉토리 이동...
cd /d c:\Ddeona-GO\travel-shopping-app

echo [3/4] Expo 캐시 정리 중...
if exist .expo\web\cache rmdir /s /q .expo\web\cache
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [4/4] 앱 시작 중 (캐시 정리)...
echo.
echo ========================================
echo   Metro Bundler가 시작됩니다
echo   웹에서 테스트: w 키 입력
echo ========================================
echo.

npx expo start --clear

pause
