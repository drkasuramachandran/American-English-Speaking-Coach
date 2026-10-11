@echo off
setlocal

cd /d "%~dp0"

title American English Speaking Coach

echo.
echo ============================================================
echo       AMERICAN ENGLISH SPEAKING COACH
echo ============================================================
echo.
echo Starting backend...
echo.

start "American English Coach - Backend" /min cmd /k "cd /d "%~dp0backend" && "%~dp0backend.venv\Scripts\python.exe" -m uvicorn server:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend...
echo.

start "American English Coach - Frontend" /min cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Opening American English Speaking Coach...
echo.

start "" "http://localhost:3000"

exit /b
