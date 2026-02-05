#!/usr/bin/env bash
# Replicate CI environment locally to test before pushing
set -euo pipefail

echo "🔧 Replicating CI environment locally..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
else
    echo "❌ nvm not found at $NVM_DIR/nvm.sh"
    echo "Please install nvm or adjust NVM_DIR"
    exit 1
fi

echo "📦 Ensuring Node 22 (latest) is available..."
if ! nvm ls 22 &>/dev/null; then
    echo "Installing Node 22 (latest)..."
    nvm install 22
fi
nvm use 22

echo "✅ Node version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clean everything like CI does
echo "🧹 Cleaning node_modules and cache..."
rm -rf node_modules
npm cache clean --force

# Run npm ci like CI does
echo "📥 Running npm ci (exactly like CI)..."
npm ci

echo "✅ Dependencies installed successfully!"

# Run all CI checks
echo "🧪 Running tests..."
npm test

echo "🔍 Running linting..."
npm run lint

echo "🔎 Running type check..."
npm run typecheck

echo "🏗️  Building library..."
npm run build

echo "📚 Building Storybook..."
npm run build-storybook

echo "✅ All CI checks passed locally!"
echo "🚀 Safe to push to GitHub!"
