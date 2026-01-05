# Render.com Deployment - Lépésről-Lépésre

## ✅ Kész lépések
- [x] Git repository létrehozva: `Renopapa/redlux-ajanlat`
- [x] Kód feltöltve GitHub-ra

## 🚀 Render.com Deployment (10-15 perc)

### 1. Regisztráció és Bejelentkezés

1. Menj: https://render.com
2. Kattints: **"Get Started for Free"**
3. Válaszd: **"Sign up with GitHub"**
4. Engedélyezd a GitHub hozzáférését
5. Bejelentkezés után a Dashboard jelenik meg

### 2. Új Web Service Létrehozása

1. **Dashboard** → Kattints a **"New +"** gombra (jobbra fent)
2. Válaszd: **"Web Service"**
3. **"Connect a repository"** résznél:
   - Kattints: **"Connect GitHub"** (ha még nem csatlakoztad)
   - Engedélyezd a `redlux-ajanlat` repository hozzáférését
   - Válaszd ki: **`Renopapa/redlux-ajanlat`**

### 3. Service Beállítások

Töltsd ki az alábbi mezőket:

```
Name: redlux-ajanlat
Region: Frankfurt (EU) vagy közel
Branch: main
Root Directory: (hagyd ÜRESEN)
Runtime: Node
Build Command: npm install --force && npm run build && npx puppeteer browsers install chrome
Start Command: npm start
Instance Type: Free
```

**Fontos:** 
- A **Root Directory**-t hagyd üresen!
- A **Build Command** tartalmazza:
  - `npm install --force` - függőségek telepítése
  - `npm run build` - React build
  - `npx puppeteer browsers install chrome` - Puppeteer Chrome telepítés
- A **Start Command**: `npm start`

### 4. Environment Variables (KRITIKUS!)

Kattints az **"Advanced"** gombra, majd **"Add Environment Variable"**:

**1. változó:**
```
Key: MONGODB_URI
Value: mongodb+srv://redluxCRM:****@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM
```
**Fontos:** Cseréld le a `****`-ot a valódi jelszóra!

**2. változó:**
```
Key: NODE_ENV
Value: production
```

**3. változó:**
```
Key: PORT
Value: 10000
```

**Fontos:** Render automatikusan beállítja a PORT-ot, de a 10000-et használjuk fallback-ként.

### 5. Deploy Indítása

1. Kattints: **"Create Web Service"**
2. Render elkezdi a build-et
3. Várj **5-10 percet** az első deploy-ra
4. A build log-ban láthatod a folyamatot

### 6. Deploy URL Megkeresése

A deploy után a service URL-je:
```
https://redlux-ajanlat.onrender.com
```

**Fontos:** Az ingyenes tier-en az első kérés **30-60 másodpercet** vesz igénybe (wake-up time).

---

## 🔧 Frontend API URL Frissítése

Miután a deploy kész, frissítsd a frontend API URL-eket:

### Fájlok, amiket frissíteni kell:
1. `src/pages/CreateQuotePage.js`
2. `src/pages/ProductManagementPage.js`
3. `src/pages/QuoteSearchPage.js`
4. `src/pages/RevenueTracker.js`
5. `src/pages/StatisticsPage.js`

### Változtatás:

**RÉGI:**
```javascript
const API_URL = 'https://redluxcrm-7bbed8528713.herokuapp.com/api';
```

**ÚJ:**
```javascript
const API_URL = 'https://redlux-ajanlat.onrender.com/api';
```

**VAGY** (ajánlott - környezeti változóval):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://redlux-ajanlat.onrender.com/api';
```

---

## 📝 Deploy Utáni Lépések

1. **Frontend API URL-ek frissítése** (fent)
2. **Commit és push:**
   ```bash
   git add .
   git commit -m "Update API URL for Render deployment"
   git push
   ```
3. **Render automatikusan újra deployol** (ha auto-deploy be van kapcsolva)
4. **Tesztelés:**
   - Nyisd meg: `https://redlux-ajanlat.onrender.com`
   - Ellenőrizd, hogy működik-e az alkalmazás

---

## ⚠️ Fontos Megjegyzések

### Render.com Ingyenes Tier:
- **Sleeping**: 15 perc inaktivitás után "alszik"
- **Wake-up time**: 30-60 másodperc az első kéréshez
- **CPU/RAM**: Limitált, de kisebb app-okhoz elég
- **Bandwidth**: 100GB/hó

### MongoDB Atlas:
- ✅ Már be van állítva és működik
- ✅ Connection string megvan
- ⚠️ Adatok: 0 dokumentum (újra kell kezdeni)

---

## 🆘 Problémamegoldás

### Build hiba:
- Ellenőrizd a build log-ot a Render Dashboard-on
- Gyakori problémák:
  - `npm install` hiba → függőségek problémája
  - `npm run build` hiba → React build hiba
  - Port hiba → PORT environment variable

### MongoDB connection hiba:
- Ellenőrizd, hogy a `MONGODB_URI` be van-e állítva
- IP engedélyezve a MongoDB Atlas-ban? (0.0.0.0/0)

### App nem elérhető:
- Várj 30-60 másodpercet (wake-up time)
- Ellenőrizd a service log-okat

---

## ✅ Checklist

- [ ] Render.com regisztráció
- [ ] GitHub repository csatlakoztatva
- [ ] Web Service létrehozva
- [ ] Environment variables beállítva (MONGODB_URI, NODE_ENV, PORT)
- [ ] Deploy sikeres
- [ ] Service URL megkaptad
- [ ] Frontend API URL-ek frissítve
- [ ] Újra commitolva és pusholva
- [ ] Újra deployolva
- [ ] Tesztelés: alkalmazás működik

---

**Készítve**: 2024  
**Platform**: Render.com (ingyenes tier)  
**Repository**: Renopapa/redlux-ajanlat

