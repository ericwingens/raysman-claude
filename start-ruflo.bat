@echo off
echo Starting RuFlo daemon for CT-MUSIQ project...
npx claude-flow@alpha daemon start --background
if %errorlevel% neq 0 (
    echo Failed to start daemon. Check that Node.js is installed.
    echo Run: node --version
    pause
    exit /b 1
)
echo RuFlo daemon started successfully.
echo Run "npx claude-flow@alpha daemon status" to check status.
