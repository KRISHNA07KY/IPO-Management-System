@echo off
echo ================================
echo IPO Management System - Quick Setup
echo ================================
echo.

echo Checking if PHP is installed...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP 8.0+ and add it to your PATH
    echo Download from: https://www.php.net/downloads
    pause
    exit /b 1
)

echo PHP is installed!
echo.

echo Current directory: %cd%
echo.

echo Starting PHP development server...
echo.
echo The website will be available at: http://localhost:8000
echo.
echo IMPORTANT: Make sure your MySQL database is running!
echo Update database credentials in api\index.php if needed
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
php -S localhost:8000

pause