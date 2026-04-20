@echo off
echo ==================================================
echo Starting Flipko Unified Suite (Django + Reaction)
echo ==================================================

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

:: Start Backend
echo Starting Django Backend on http://127.0.0.1:8080/
start cmd /k "call venv\Scripts\activate.bat && cd backend && python manage.py makemigrations && python manage.py migrate && python manage.py runserver 8080"

:: Start Frontend
echo Starting React Frontend (Reaction) on http://localhost:5173/
cd frontend-reaction
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
start cmd /k "npm run dev"

:: Open browser
echo Launching browser...
start cmd /c "timeout /t 5 >nul && start http://localhost:5173/"

echo Flipko is starting up...
pause
