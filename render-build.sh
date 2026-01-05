#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Ensure the Puppeteer cache directory exists
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
# A PUPPETEER_CACHE_DIR beállítás miatt a Chrome közvetlenül a /opt/render/.cache/puppeteer mappába települ
# Ez a mappa perzisztens a Render.com-on, így a runtime-ban is elérhető lesz
echo "Installing Chrome for Puppeteer..."
PUPPETEER_CACHE_DIR=$PUPPETEER_CACHE_DIR npx puppeteer browsers install chrome

echo "Chrome installation completed. Cache location: $PUPPETEER_CACHE_DIR"

