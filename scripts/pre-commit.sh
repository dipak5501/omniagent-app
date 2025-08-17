#!/bin/bash

# Pre-commit script to run all checks before pushing
# This ensures CI/CD won't fail due to code quality issues

set -e  # Exit on any error

echo "🔍 Running pre-commit checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Please run this script from the project root."
    exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun first."
    exit 1
fi

print_status "Bun version: $(bun --version)"

# Check if Biome is available
if ! bunx biome --version &> /dev/null; then
    print_error "Biome is not available. Please install dependencies with 'bun install'"
    exit 1
fi

print_status "Biome version: $(bunx biome --version)"

# Run all checks
echo ""
echo "🧹 Running Biome linting..."
if bun run lint:biome; then
    print_status "Biome linting passed"
else
    print_error "Biome linting failed"
    exit 1
fi

echo ""
echo "🔍 Running ESLint..."
if bun run lint; then
    print_status "ESLint passed"
else
    print_error "ESLint failed"
    exit 1
fi

echo ""
echo "📝 Checking code formatting..."
if bun run format:check; then
    print_status "Code formatting is correct"
else
    print_error "Code formatting issues found. Run 'bun run format' to fix."
    exit 1
fi

echo ""
echo "🔧 Running TypeScript type checking..."
if bunx tsc --noEmit; then
    print_status "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    exit 1
fi

echo ""
echo "🏗️  Building project..."
if bun run build; then
    print_status "Build successful"
else
    print_error "Build failed"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Your code is ready for push."
echo ""
print_warning "Note: The Dynamic SDK warnings are expected in development and don't affect functionality."
echo "" 