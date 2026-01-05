# Commit és Push - Gyors Útmutató

## 🚨 Probléma
A frontend nem látja a termékeket, mert a Render.com még a régi kódot buildeli (régi Heroku URL-lel).

## ✅ Megoldás

Futtasd ezeket a parancsokat a **projekt mappájában** (nem a home könyvtárban!):

```bash
# 1. Változtatások hozzáadása
git add src/config/api.js
git add src/pages/CreateQuotePage.js
git add src/pages/ProductManagementPage.js
git add src/pages/QuoteSearchPage.js
git add src/pages/RevenueTracker.js
git add src/pages/StatisticsPage.js
git add .gitignore

# 2. Commit
git commit -m "Fix: Update API URLs to Render.com and centralize config"

# 3. Push
git push origin main
```

**VAGY** ha `master` branch-en vagy:
```bash
git push origin master
```

## 🔍 Ellenőrzés

Miután pusholtad:
1. Render Dashboard → Logs
2. Várd meg az új build-et (5-10 perc)
3. Frissítsd az oldalt a böngészőben (Ctrl+F5)

## 📝 Mi változott?

- ✅ Létrehoztam: `src/config/api.js` - központi API URL
- ✅ Frissítettem: minden oldal importálja az új config-ot
- ✅ Eltávolítottam: régi Heroku URL-ek

---

**Fontos:** A commit után a Render.com automatikusan újra deployol (ha auto-deploy be van kapcsolva).

