@echo off
title OmniChat AI Launcher
echo ===================================================
echo           Starting OmniChat AI Chatbot
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Freeing ports 8000, 5000, 3000 if occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/4] Starting Python FastAPI Backend (Port 8000)...
start "OmniChat - Python AI Backend (8000)" cmd /k "cd /d "%~dp0AI PROJECT" && python -m uvicorn main:app --port 8000 --reload"

echo [3/4] Starting Node Express Proxy (Port 5000)...
start "OmniChat - Express Backend (5000)" cmd /k "cd /d "%~dp0chatbot_backend" && npm start"

echo [4/4] Starting React Frontend (Port 3000)...
start "OmniChat - React Frontend (3000)" cmd /k "cd /d "%~dp0chatbot_frontend" && npm start"

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo ===================================================
echo  All 3 services are running!
echo  - Python Backend:  http://localhost:8000/docs
echo  - Express Backend: http://localhost:5000
echo  - React Frontend:  http://localhost:3000
echo ===================================================
echo.
pause
