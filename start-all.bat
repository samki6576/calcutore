@echo off
echo ========================================
echo Meeting Cost Calculator
echo ========================================
echo.
echo Starting Backend...
start "Backend Server" cmd /c "cd C:\meeting-cost-calculator\backend && node src/index.js"
timeout /t 3 /nobreak > nul
echo Starting Dashboard...
start "Dashboard" cmd /c "cd C:\meeting-cost-calculator\dashboard && npm run dev"
echo.
echo ========================================
echo READY!
echo ========================================
echo Backend:  http://localhost:3001
echo Dashboard: http://localhost:5173
echo ========================================
echo.
pause
