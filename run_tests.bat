@echo off
REM Unit Test Runner for Shop Application
REM This script runs all unit tests for the Django shop application

echo ========================================
echo Django Shop Application - Unit Tests
echo ========================================
echo.

REM Check if virtual environment is activated
python --version
echo.

echo Starting MySQL server check...
echo Note: Make sure MySQL server is running on localhost
echo.

REM Prompt user to continue
set /p continue="Press Enter to continue with tests (or Ctrl+C to cancel)..."

echo.
echo ========================================
echo Running All Tests
echo ========================================
python manage.py test --verbosity=2

echo.
echo ========================================
echo Test Summary by App
echo ========================================

echo.
echo Running Configuration Tests...
python manage.py test configuration.tests --verbosity=1

echo.
echo Running User Tests...
python manage.py test user.tests --verbosity=1

echo.
echo Running Product Tests...
python manage.py test product.tests --verbosity=1

echo.
echo Running Bill Tests...
python manage.py test bill.tests --verbosity=1

echo.
echo Running Asset Tests...
python manage.py test asset.tests --verbosity=1

echo.
echo ========================================
echo All Tests Complete!
echo ========================================
echo.
echo For detailed documentation, see TESTING_DOCUMENTATION.md
echo.

pause
