# Render.com Deploy Idő

## ⏱️ Normális deploy idők

- **Free tier**: 5-15 perc (első deploy esetén akár 20 perc is lehet)
- **Paid tier**: 2-5 perc

## 🔍 Miért lehet hosszú?

1. **Első deploy**: Minden dependency-t le kell tölteni
2. **Build process**: React build + Puppeteer Chrome telepítés
3. **Free tier korlátok**: Lassabb CPU, kevesebb erőforrás
4. **Dependency telepítés**: `npm install` sok időt vehet igénybe

## ✅ Ellenőrzés

1. **Render Dashboard** → `redlux-ajanlat` service
2. **Logs** fül
3. Nézd meg, hogy:
   - Még buildel? → Várj tovább
   - Hiba van? → Javítsd
   - Kész? → Frissítsd az oldalt

## 🚨 Ha túl hosszú (>20 perc)

- Lehet, hogy timeout van
- Vagy valami hiba van
- Nézd meg a logokat!

## 💡 Tipp

A logokban látszik, hogy hol tart:
- `npm install` → Dependency telepítés
- `npm run build` → React build
- `node backend/server.js` → Server indítás

