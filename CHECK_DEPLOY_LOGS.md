# Render.com Deploy Hiba Ellenőrzés

## 🔍 Mit nézz meg a logokban?

### 1. Build fázis hibák
- `npm install` hibák?
- `npm run build` hibák?
- Puppeteer Chrome telepítés hibák?

### 2. Timeout hibák
- "Build timeout"
- "Deploy timeout"

### 3. Dependency hibák
- "Module not found"
- "Cannot find package"

### 4. Memory/Resource hibák
- "Out of memory"
- "Process killed"

## 🚨 Gyakori problémák

### Build Command probléma
Ellenőrizd a Render.com-on:
- **Settings** → **Build Command**
- Legyen: `npm install --force && npm run build`

### Environment Variables
Ellenőrizd, hogy a `MONGODB_URI` helyesen van-e beállítva

### Package.json script-ek
Ellenőrizd, hogy a `build` és `start` script-ek helyesek-e

## 💡 Mit csinálj?

1. **Render Dashboard** → `redlux-ajanlat` service
2. **Logs** fül
3. **Scrollozz le** a legutóbbi hibákhoz
4. **Másold ki** a hibaüzenetet
5. Küldd el, és javítjuk!

