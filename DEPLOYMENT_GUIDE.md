# Deployment Útmutató - Heroku Alternatíva

## 🚨 Jelenlegi Helyzet

- ❌ Heroku fiók törölve (nem fizetés miatt)
- ❌ Alkalmazás nem elérhető
- ⚠️ MongoDB adatbázis valószínűleg elveszett (ha Heroku addon volt)
- ✅ Kód lokálisan megvan

---

## 🎯 Ajánlott Megoldás: Render.com + MongoDB Atlas

### Miért ez a kombináció?
- **Render.com**: Ingyenes tier, egyszerű deployment, automatikus SSL
- **MongoDB Atlas**: Ingyenes tier (512MB), külön szolgáltatás, nem törlődik
- **Költség**: $0/hó (ingyenes tier-ekkel)

---

## 📋 Lépésről-Lépésre Deployment

### 1. MongoDB Atlas Beállítása (5 perc)

1. **Regisztráció**: https://www.mongodb.com/cloud/atlas/register
2. **Cluster létrehozása**:
   - Válaszd az **M0 Free Tier**-t
   - Válassz régiót (pl. Frankfurt - közel van)
   - Kattints "Create Cluster"
3. **Database Access** (felhasználó létrehozása):
   - Database Access → Add New Database User
   - Username: `redlux-admin`
   - Password: generálj egy erős jelszót (MÁSOLD EL!)
   - Database User Privileges: "Atlas admin"
4. **Network Access** (IP engedélyezés):
   - Network Access → Add IP Address
   - "Allow Access from Anywhere" (0.0.0.0/0) - vagy csak Render IP-k
5. **Connection String lekérése**:
   - Clusters → Connect → Connect your application
   - Másold a connection string-et
   - Cseréld le: `<password>` → a generált jelszó
   - Cseréld le: `<dbname>` → `redlux` (vagy amit akarsz)

**Példa connection string:**
```
mongodb+srv://redlux-admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/redlux?retryWrites=true&w=majority
```

---

### 2. Render.com Beállítása (10 perc)

#### 2.1 Regisztráció
1. Menj: https://render.com
2. Regisztrálj GitHub fiókkal (ajánlott)

#### 2.2 Új Web Service Létrehozása
1. Dashboard → "New +" → "Web Service"
2. **Connect GitHub repository**:
   - Ha nincs repo, hozz létre egyet GitHub-on
   - Vagy használd a meglévőt (ha van)
3. **Repository kiválasztása**
4. **Beállítások**:
   - **Name**: `redlux-crm` (vagy amit akarsz)
   - **Region**: Frankfurt (vagy közel)
   - **Branch**: `main` (vagy `master`)
   - **Root Directory**: (hagyd üresen)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** (ingyenes)

#### 2.3 Environment Variables (KRITIKUS!)
Render Dashboard → Environment → Add Environment Variable:

```
MONGODB_URI=mongodb+srv://redlux-admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/redlux?retryWrites=true&w=majority
NODE_ENV=production
PORT=10000
```

**Fontos**: Cseréld le a `<PASSWORD>`-t a MongoDB Atlas jelszóra!

#### 2.4 Deploy
- Kattints "Create Web Service"
- Render automatikusan elkezdi a build-et
- Várj 5-10 percet az első deploy-ra

---

### 3. Frontend API URL Frissítése

A frontend kódban frissítsd az API URL-t:

```javascript
// src/pages/CreateQuotePage.js (és más helyeken is)
const API_URL = process.env.REACT_APP_API_URL || 'https://redlux-crm.onrender.com/api';
```

Vagy használj környezeti változót:
```javascript
// src/config/api.js
const API_URL = process.env.REACT_APP_API_URL || 'https://redlux-crm.onrender.com/api';
export default API_URL;
```

---

### 4. Build és Deploy

#### Lokális tesztelés:
```bash
# 1. .env fájl létrehozása (lokális fejlesztéshez)
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "PORT=5000" >> .env

# 2. Telepítés
npm install

# 3. Build
npm run build

# 4. Tesztelés
npm start
```

#### Render automatikus deploy:
- Ha GitHub-on van a repo, Render automatikusan deployol minden push után
- Vagy manuálisan: Render Dashboard → Manual Deploy

---

## 🔄 Alternatív Megoldások

### Opció 2: Railway.app
- **Előnyök**: Gyorsabb, modern UI
- **Hátrányok**: Ingyenes tier limitáltabb
- **Költség**: $0/hó (ingyenes tier)

**Deployment**:
1. Regisztráció: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Environment variables beállítása
4. Deploy!

### Opció 3: Fly.io
- **Előnyök**: Jó teljesítmény, Docker-alapú
- **Hátrányok**: Kicsit bonyolultabb setup
- **Költség**: $0/hó (ingyenes tier)

### Opció 4: Vercel (Frontend) + Railway (Backend)
- **Előnyök**: Vercel ingyenes tier nagyon jó frontend-hez
- **Hátrányok**: Két külön szolgáltatás kezelése
- **Költség**: $0/hó

---

## ⚠️ Fontos Megjegyzések

### Render.com Ingyenes Tier Korlátok:
- **Sleeping**: 15 perc inaktivitás után "alszik", első kérés lassabb (30-60 másodperc)
- **CPU/RAM**: Limitált, de kisebb app-okhoz elég
- **Bandwidth**: 100GB/hó

### MongoDB Atlas Ingyenes Tier:
- **Storage**: 512MB (kisebb app-okhoz elég)
- **RAM**: 2GB
- **Backup**: Nincs automatikus backup (csak fizetős tier-en)

### Adatbázis Backup:
Ha van régi adatbázis backup, importálhatod:
```bash
mongorestore --uri="mongodb+srv://..." --db=redlux ./backup-folder
```

---

## 🚀 Gyors Start (Render.com)

1. **MongoDB Atlas**: 5 perc setup
2. **Render.com**: 10 perc setup
3. **Deploy**: 5-10 perc build
4. **Összesen**: ~20 perc és működik!

---

## 📝 Checklist

- [ ] MongoDB Atlas cluster létrehozva
- [ ] Database user létrehozva
- [ ] Network Access beállítva
- [ ] Connection string másolva
- [ ] Render.com account létrehozva
- [ ] GitHub repo kész (vagy meglévő)
- [ ] Render Web Service létrehozva
- [ ] Environment variables beállítva
- [ ] Frontend API URL frissítve
- [ ] Deploy sikeres
- [ ] Tesztelés: alkalmazás működik

---

## 🆘 Problémamegoldás

### Build hiba Render-en:
- Ellenőrizd a build log-ot
- `npm install` sikeres volt?
- `npm run build` sikeres volt?

### MongoDB connection hiba:
- IP engedélyezve a MongoDB Atlas-ban?
- Jelszó helyes?
- Connection string formátuma helyes?

### App "sleeping":
- Ez normális az ingyenes tier-en
- Első kérés után 30-60 másodperc alatt felébred
- Fizetős tier-en nincs sleeping

---

## 💰 Költség Összefoglaló

| Szolgáltatás | Ingyenes Tier | Fizetős (ha kell) |
|-------------|---------------|-------------------|
| Render.com | ✅ $0/hó | $7/hó (Standard) |
| MongoDB Atlas | ✅ $0/hó | $9/hó (M10) |
| **ÖSSZESEN** | **$0/hó** | **$16/hó** |

---

**Készítve**: 2024  
**Státusz**: Új deployment terv Heroku alternatíva

