@echo off
REM Pre-commit script to run all checks before pushing
REM This ensures CI/CD won't fail due to code quality issues

echo 🔍 Running pre-commit checks...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Not in project root directory. Please run this script from the project root.
    exit /b 1
)

REM Check if bun is installed
bun --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Bun is not installed. Please install Bun first.
    exit /b 1
)

echo ✅ Bun version: 
bun --version

REM Check if Biome is available
bunx biome --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Biome is not available. Please install dependencies with 'bun install'
    exit /b 1
)

echo ✅ Biome version:
bunx biome --version

echo.
echo 🧹 Running Biome linting...
bun run lint:biome
if errorlevel 1 (
    echo ❌ Biome linting failed
    exit /b 1
)
echo ✅ Biome linting passed

echo.
echo 🔍 Running ESLint...
bun run lint
if errorlevel 1 (
    echo ❌ ESLint failed
    exit /b 1
)
echo ✅ ESLint passed

echo.
echo 📝 Checking code formatting...
bun run format:check
if errorlevel 1 (
    echo ❌ Code formatting issues found. Run 'bun run format' to fix.
    exit /b 1
)
echo ✅ Code formatting is correct

echo.
echo 🔧 Running TypeScript type checking...
bunx tsc --noEmit
if errorlevel 1 (
    echo ❌ TypeScript type checking failed
    exit /b 1
)
echo ✅ TypeScript type checking passed

echo.
echo 🏗️  Building project...
bun run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful

echo.
echo 🎉 All checks passed! Your code is ready for push.
echo.
echo ⚠️  Note: The Dynamic SDK warnings are expected in development and don't affect functionality.
echo. 