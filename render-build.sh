#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Uncomment this line if you need to build your project
npm run build

# Install Puppeteer and download Chrome
# Ne állítsuk be a PUPPETEER_CACHE_DIR-t, így a Chrome a node_modules/puppeteer/.local-chromium mappába települ
# Ez a mappa perzisztens a Render.com-on, mert a node_modules része a build-nek
echo "Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

echo "Chrome installation completed. Chrome is in node_modules/puppeteer/.local-chromium"

