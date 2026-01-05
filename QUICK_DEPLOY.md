# Gyors Deployment - Render.com

## 🎯 Git Beállítások
- **User**: NovaroDigitalHungary
- **Email**: digitalnovaro@gmail.com

## 📋 Lépésről-Lépésre Deployment

### 1. GitHub Repository Létrehozása (5 perc)

1. Menj: https://github.com/new
2. **Repository neve**: `redlux-ajanlat`
3. **Public** vagy **Private** (ajánlott: Private)
4. **NE** add hozzá a README-t, .gitignore-t, stb. (már van)
5. Kattints "Create repository"

### 2. Lokális Git Repository Beállítása

```bash
# 1. Git inicializálás (ha még nincs)
git init

# 2. Remote hozzáadása
git remote add origin https://github.com/Renopapa/redlux-ajanlat.git

# 3. Fájlok hozzáadása
git add .

# 4. Commit
git commit -m "Initial commit - RedLux CRM"

# 5. Push
git push -u origin main
```

**Vagy ha már van main branch:**
```bash
git branch -M main
git push -u origin main
```

### 3. Render.com Beállítása (10 perc)

1. **Regisztráció**: https://render.com
   - Kattints "Get Started for Free"
   - Jelentkezz be GitHub fiókkal

2. **Új Web Service**:
   - Dashboard → "New +" → "Web Service"
   - **Connect GitHub repository**: Válaszd ki a `redlux-crm` repo-t
   - Kattints "Connect"

3. **Service Beállítások**:
   ```
   Name: redlux-ajanlat
   Region: Frankfurt (vagy közel)
   Branch: main
   Root Directory: (hagyd üresen)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Environment Variables** (KRITIKUS!):
   Kattints "Advanced" → "Add Environment Variable":
   
   ```
   MONGODB_URI = mongodb+srv://redluxCRM:redlux123@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM
   NODE_ENV = production
   PORT = 10000
   ```

5. **Deploy**:
   - Kattints "Create Web Service"
   - Várj 5-10 percet az első build-re

### 4. Frontend API URL Frissítése

A frontend kódban frissítsd az API URL-t:

**Fájlok:**
- `src/pages/CreateQuotePage.js`
- `src/pages/ProductManagementPage.js`
- `src/pages/QuoteSearchPage.js`
- `src/pages/RevenueTracker.js`
- `src/pages/StatisticsPage.js`

**Változtatás:**
```javascript
// RÉGI:
const API_URL = 'https://redluxcrm-7bbed8528713.herokuapp.com/api';

// ÚJ (Render URL - a deploy után kapod meg):
const API_URL = 'https://redlux-ajanlat.onrender.com/api';
```

**VAGY** használj környezeti változót (ajánlott):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://redlux-ajanlat.onrender.com/api';
```

### 5. Újra Build és Deploy

```bash
# 1. Commit a változtatásokat
git add .
git commit -m "Update API URL for Render deployment"
git push

# 2. Render automatikusan újra deployol
```

---

## 🔗 Render URL Formátum

A Render URL formátuma:
```
https://[service-name].onrender.com
```

Tehát ha a service neve `redlux-ajanlat`, akkor:
```
https://redlux-ajanlat.onrender.com
```

---

## ⚠️ Fontos Megjegyzések

### Render.com Ingyenes Tier:
- **Sleeping**: 15 perc inaktivitás után "alszik"
- **Első kérés**: 30-60 másodperc (wake-up time)
- **CPU/RAM**: Limitált, de kisebb app-okhoz elég
- **Bandwidth**: 100GB/hó

### MongoDB Atlas:
- ✅ Már be van állítva és működik
- ✅ Connection string megvan
- ⚠️ Adatok: 0 dokumentum (újra kell kezdeni)

---

## 🚀 Gyors Start Parancsok

```bash
# 1. Git setup
git init
git remote add origin https://github.com/Renopapa/redlux-ajanlat.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main

# 2. Render.com-on:
# - Connect repo
# - Add environment variables
# - Deploy!

# 3. Frontend frissítés
# - Frissítsd az API URL-eket
# - Commit és push
```

---

## 📝 Checklist

- [ ] GitHub repo létrehozva
- [ ] Lokális git inicializálva
- [ ] Remote hozzáadva
- [ ] Fájlok commitolva és pusholva
- [ ] Render.com account létrehozva
- [ ] Web Service létrehozva
- [ ] Environment variables beállítva
- [ ] Deploy sikeres
- [ ] Frontend API URL-ek frissítve
- [ ] Újra deployolva
- [ ] Tesztelés: alkalmazás működik

---

**Készítve**: 2024  
**Platform**: Render.com (ingyenes tier)  
**MongoDB**: Atlas (már beállítva)

