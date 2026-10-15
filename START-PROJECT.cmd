@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed. See README.md for troubleshooting.
    pause
    exit /b 1
  )
)
call npm.cmd run start:local
pause
