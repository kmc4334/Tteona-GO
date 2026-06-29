@echo off
cls
echo ╔════════════════════════════════════════╗
echo ║   Metro 완전 재시작 스크립트          ║
echo ╚════════════════════════════════════════╝
echo.
echo [단계 1/5] 모든 Node 프로세스 강제 종료...
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo ✓ Node 프로세스 종료 완료
) else (
    echo ✓ 실행 중인 Node 프로세스 없음
)
timeout /t 2 >nul
echo.

echo [단계 2/5] 작업 디렉토리 이동...
cd /d "c:\Ddeona-GO\travel-shopping-app"
echo ✓ 디렉토리: %cd%
echo.

echo [단계 3/5] Metro 캐시 삭제...
if exist ".expo\web\cache" (
    rmdir /s /q ".expo\web\cache"
    echo ✓ .expo\web\cache 삭제됨
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ node_modules\.cache 삭제됨
)
echo.

echo [단계 4/5] Watchman 캐시 삭제 (있는 경우)...
if exist "%LOCALAPPDATA%\Temp\watchman" (
    rmdir /s /q "%LOCALAPPDATA%\Temp\watchman" 2>nul
)
echo ✓ 완료
echo.

echo [단계 5/5] Metro Bundler 시작 (캐시 정리 모드)...
echo.
echo ╔════════════════════════════════════════╗
echo ║  잠시 후 Metro가 시작됩니다           ║
echo ║  QR 코드가 나타나면:                  ║
echo ║  → w 키: 웹 브라우저에서 열기         ║
echo ║  → a 키: Android 에뮬레이터           ║
echo ║  → i 키: iOS 시뮬레이터 (Mac)         ║
echo ╚════════════════════════════════════════╝
echo.
timeout /t 3 >nul

npx expo start --clear

echo.
echo Metro가 종료되었습니다.
pause
