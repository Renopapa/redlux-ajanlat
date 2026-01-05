#!/usr/bin/env bash
# exit on error
set -o errexit

# Set Puppeteer cache directory to project directory (persistent on Render)
export PUPPETEER_CACHE_DIR=/opt/render/project/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install dependencies
npm ci

# Build the project
npm run build

# Install Puppeteer Chrome
# The PUPPETEER_CACHE_DIR is set above, so Chrome will be installed there
echo "Installing Chrome for Puppeteer..."
PUPPETEER_CACHE_DIR=$PUPPETEER_CACHE_DIR npx puppeteer browsers install chrome

echo "Chrome installation completed. Cache location: $PUPPETEER_CACHE_DIR"

