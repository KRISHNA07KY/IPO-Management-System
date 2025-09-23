@echo off
echo Starting IPO Management System Server...
echo.
echo Make sure PHP is installed and in your PATH.
echo If you get a "php is not recognized" error, please install PHP first.
echo.
cd /d "%~dp0web"
php -S localhost:8000
pause