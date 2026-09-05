@echo off
title Capital Guard - Launcher
echo ========================================================
echo STARTING CAPITAL GUARD PLATFORM
echo ========================================================

echo 1. Starting FastAPI Backend Server on http://127.0.0.1:8000...
start "Capital Guard Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python run.py"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Web Application on http://localhost:5173...
start "Capital Guard Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo 3. Opening Platform in Default Web Browser...
start http://localhost:5173

echo ========================================================
echo Capital Guard is running!
echo - Frontend: http://localhost:5173
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
