# Migrációs Terv - Árajánlat Készítő → CRM Rendszer

## 🎯 Alapelv: Zero Downtime Migration

**Fontos:** A jelenlegi rendszer továbbra is **teljes mértékben működik** minden lépés során. Új funkciókat adunk hozzá, nem törünk meg semmit.

---

## 📋 Általános Stratégia

### 1. **Backward Compatibility (Visszafelé kompatibilitás)**
- Minden régi API endpoint továbbra is működik
- Új mezők opcionálisak (nem kötelező kitölteni)
- Fokozatos átmenet az új rendszerre

### 2. **Feature Flags**
- Új funkciók először "beta" módban
- Régi funkciók továbbra is elérhetők
- Lássuk elérhetővé egyszerre a régi és új UI-t

### 3. **Git Branching Stratégia**
```
main (production) - jelenlegi működő rendszer
  └── develop (fejlesztési branch)
       └── feature/crm-modules (új funkciók)
```

---

## 🚀 Lépésről-Lépésre Terv

### **LÉPÉS 1: Alapvető Infrastruktúra (1-2 nap)** ⚠️ KRITIKUS

#### 1.1 Git Branch és Backup
```bash
# 1. Commit minden változást a main branch-re
git add .
git commit -m "Stable state before CRM migration"
git push

# 2. Hozz létre develop branch-et
git checkout -b develop
git push -u origin develop

# 3. Készíts backup-ot az adatbázisról!
# MongoDB backup parancs:
mongodump --uri="YOUR_MONGODB_URI" --out=./backup-$(date +%Y%m%d)
```

#### 1.2 Projekt struktúra előkészítése (ÚJ mappák, RÉGI fájlok megmaradnak)
```
arajanlat-keszito/
├── backend/
│   ├── server.js (MEGMARAD - működik továbbra is)
│   ├── pdfGenerator.js (MEGMARAD)
│   ├── templates/ (MEGMARAD)
│   ├── src/ (ÚJ - itt lesznek az új modulok)
│   │   ├── routes/ (új route fájlok)
│   │   ├── models/ (új modellek, DE a régiek is maradnak)
│   │   ├── controllers/ (új controllers)
│   │   └── middleware/ (új middleware-ek)
│   └── config/ (ÚJ - konfigurációs fájlok)
│
├── src/ (MEGMARAD - régi frontend)
│   └── ... (mindent megtartunk)
│
└── src-crm/ (ÚJ - új CRM komponensek - OPCIÓS)
    └── ... (csak új komponensek, amik a régi rendszert bővítik)
```

**✅ Ebben a lépésben:** Semmi nem törlődik, csak új mappákat hozunk létre.

---

### **LÉPÉS 2: Kód Refaktorálás (3-5 nap)** - Nem törünk meg semmit!

#### 2.1 Backend Route Separation

**Most:**
```javascript
// backend/server.js - 863 sor, minden benne van
app.get('/api/quotes', ...)
app.post('/api/quotes', ...)
// stb.
```

**Új struktúra (másoljuk át, nem töröljük):**

```javascript
// backend/src/routes/quotes.js (ÚJ fájl)
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  // MÁSOLT kód a server.js-ből
});

module.exports = router;
```

```javascript
// backend/server.js (MÓDOSÍTJUK, de a régi route-ok is maradnak)
require('dotenv').config();
const express = require('express');
// ... meglévő kód ...

// RÉGI route-ok (megmaradnak!)
app.get('/api/quotes', async (req, res) => {
  // ... régi kód ...
});

// ÚJ route-ok (új router-ek)
const quotesRouter = require('./src/routes/quotes');
app.use('/api/quotes', quotesRouter); // VAGY csak /api/v2/quotes

// ... többi meglévő kód ...
```

**✅ Eredmény:** Mindkét endpoint működik:
- `/api/quotes` (régi, működik)
- `/api/v2/quotes` (új, ugyanazt csinálja, de refaktorált)

#### 2.2 Modellek Szeparáció

**Most:**
```javascript
// backend/server.js
const quoteSchema = new mongoose.Schema({...});
const Quote = mongoose.model('Quote', quoteSchema);
```

**Új:**
```javascript
// backend/src/models/Quote.js (ÚJ fájl)
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // UGYANAZ a séma, mint eddig
  clientName: String,
  clientId: String,
  // ...
});

module.exports = mongoose.model('Quote', quoteSchema);
```

```javascript
// backend/server.js
// RÉGI (megmarad):
const quoteSchema = new mongoose.Schema({...});
const Quote = mongoose.model('Quote', quoteSchema);

// VAGY átváltás:
const Quote = require('./src/models/Quote'); // ugyanazt a modellt használja
```

**✅ Eredmény:** Nincs változás az adatbázisban, ugyanazok a modellek.

---

### **LÉPÉS 3: Konfigurációk Javítása (1 nap)**

#### 3.1 API URL környezeti változóba

**Most:**
```javascript
// src/pages/CreateQuotePage.js
const API_URL = 'https://redluxcrm-7bbed8528713.herokuapp.com/api';
```

**Új (Backward Compatible):**
```javascript
// src/config/api.js (ÚJ fájl)
const API_URL = process.env.REACT_APP_API_URL || 'https://redluxcrm-7bbed8528713.herokuapp.com/api';

export default API_URL;
```

```javascript
// src/pages/CreateQuotePage.js
// RÉGI sor kommentelve marad, új import:
// const API_URL = 'https://redluxcrm-7bbed8528713.herokuapp.com/api'; // DEPRECATED
import API_URL from '../config/api';
```

**✅ Eredmény:** Ha nincs `.env`, ugyanaz az URL mint eddig.

#### 3.2 CORS Beállítások Javítása

**Most:**
```javascript
// backend/server.js
app.use(cors()); // mindent engedélyez
```

**Új:**
```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', // Alapból még minden, majd szűkítjük
  credentials: true
};

app.use(cors(corsOptions));
```

**✅ Eredmény:** Alapból ugyanúgy működik, majd fokozatosan szűkítjük.

---

### **LÉPÉS 4: Új Modell Hozzáadása (Nem töröljük a régit!) (2-3 nap)**

#### 4.1 Customer Modell (ÚJ, de a Quote-ban lévő adatok megmaradnak)

```javascript
// backend/src/models/Customer.js (ÚJ)
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Meglévő adatok (Quoteból):
  name: String,           // clientName-ből
  clientId: String,        // már létezik
  address: String,         // clientAddress-ból
  phone: String,           // clientPhone-ból
  email: String,           // clientEmail-ból
  needs: String,           // clientNeeds-ből
  
  // ÚJ mezők:
  status: {
    type: String,
    enum: ['lead', 'customer', 'former'],
    default: 'lead'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index a kereséshez
customerSchema.index({ clientId: 1 });
customerSchema.index({ name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
```

**✅ Eredmény:** Új modell, de a régi Quote modell **megmarad** és továbbra is működik.

#### 4.2 Migrációs Script (Opcionális - manuálisan futtatható)

```javascript
// backend/scripts/migrate-customers.js (ÚJ)
const mongoose = require('mongoose');
const Quote = require('../src/models/Quote');
const Customer = require('../src/models/Customer');
require('dotenv').config();

async function migrateCustomers() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const quotes = await Quote.find({});
  
  for (const quote of quotes) {
    // Ellenőrizzük, hogy létezik-e már ilyen customer
    let customer = await Customer.findOne({ clientId: quote.clientId });
    
    if (!customer) {
      // Új customer létrehozása a quote adataiból
      customer = new Customer({
        name: quote.clientName,
        clientId: quote.clientId,
        address: quote.clientAddress,
        phone: quote.clientPhone,
        email: quote.clientEmail,
        needs: quote.clientNeeds,
        createdAt: quote.createdAt
      });
      await customer.save();
      console.log(`Migrated customer: ${customer.name}`);
    }
  }
  
  console.log('Migration completed!');
  process.exit(0);
}

migrateCustomers();
```

**✅ Eredmény:** 
- Régi rendszer működik (Quote-kal)
- Új rendszer is működik (Customer-rel)
- Választható: mikor futtatod a migrációt

---

### **LÉPÉS 5: Új API Endpoints (Régi továbbra is működik) (2-3 nap)**

#### 5.1 Customer API

```javascript
// backend/src/routes/customers.js (ÚJ)
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// ÚJ endpoint-ok
router.get('/', async (req, res) => {
  // Customer lista
});

router.get('/:id', async (req, res) => {
  // Customer részletek
});

router.post('/', async (req, res) => {
  // Új customer
});

module.exports = router;
```

```javascript
// backend/server.js
// RÉGI route-ok megmaradnak:
app.get('/api/quotes', ...); // ✅ MŰKÖDIK
app.post('/api/quotes', ...); // ✅ MŰKÖDIK

// ÚJ route-ok:
const customersRouter = require('./src/routes/customers');
app.use('/api/customers', customersRouter); // ✅ ÚJ, de nem zavarja a régit
```

**✅ Eredmény:**
- `/api/quotes` - régi, működik ✅
- `/api/customers` - új, működik ✅
- Semmi nem törött el ✅

---

### **LÉPÉS 6: Frontend Bővítés (Régi megmarad!) (3-5 nap)**

#### 6.1 Új Komponensek (Régi megmarad)

```
src/
├── pages/
│   ├── CreateQuotePage.js (MEGMARAD - működik) ✅
│   ├── QuoteSearchPage.js (MEGMARAD - működik) ✅
│   └── ... (minden régi oldal megmarad)
│
└── pages-crm/ (ÚJ mappa - új CRM oldalak)
    ├── CustomersPage.js (ÚJ)
    ├── ProjectsPage.js (ÚJ)
    └── DashboardPage.js (ÚJ)
```

#### 6.2 Routing Bővítés (Régi útvonalak megmaradnak)

```javascript
// src/App.js
<Routes>
  {/* RÉGI route-ok - MŰKÖDNEK */}
  <Route path="/new-quote" element={<CreateQuotePage />} />
  <Route path="/quote/:id" element={<CreateQuotePage />} />
  <Route path="/search" element={<QuoteSearchPage />} />
  <Route path="/products" element={<ProductManagementPage />} />
  <Route path="/statistics" element={<StatisticsPage />} />
  <Route path="/revenue-tracker" element={<RevenueTracker />} />
  
  {/* ÚJ route-ok - BŐVÍTÉS */}
  <Route path="/crm/customers" element={<CustomersPage />} />
  <Route path="/crm/projects" element={<ProjectsPage />} />
  <Route path="/crm/dashboard" element={<DashboardPage />} />
</Routes>
```

**✅ Eredmény:** Minden régi oldal elérhető, új oldalak hozzáadva.

---

### **LÉPÉS 7: Autentikáció Hozzáadása (Opcionális - Régi működik) (3-5 nap)**

#### 7.1 Auth Middleware (Opcionális a régi endpoint-oknál)

```javascript
// backend/src/middleware/auth.js (ÚJ)
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  // Ha van token, validáljuk, ha nincs, megyünk tovább
  // Régi endpoint-oknál ezt használjuk
  next();
};

const requireAuth = (req, res, next) => {
  // Új endpoint-oknál ezt használjuk
  // ...
  next();
};

module.exports = { optionalAuth, requireAuth };
```

```javascript
// backend/server.js
// RÉGI route-ok - opcionális auth (működnek token nélkül is)
app.get('/api/quotes', optionalAuth, async (req, res) => {
  // ... régi kód, működik token nélkül is
});

// ÚJ route-ok - kötelező auth
app.use('/api/customers', requireAuth, customersRouter);
```

**✅ Eredmény:**
- Régi rendszer működik auth nélkül ✅
- Új funkciók védve vannak ✅

---

## 📊 Progress Tracking

### Tesztelési Checklist Minden Lépésnél

- [ ] Régi árajánlat létrehozás működik
- [ ] Régi árajánlat keresés működik
- [ ] PDF generálás működik
- [ ] Termékkezelés működik
- [ ] Statisztikák működik
- [ ] Bevétel-költség nyomon követés működik
- [ ] Új funkciók működnek
- [ ] Nincs konzol hiba

---

## ⚠️ Fontos Szabályok

### ❌ SOHA NE TÉGY EZEKET:

1. **NE törölj meglévő fájlokat** - csak kommenteld vagy nevezd át `.old`-ra
2. **NE változtass meglévő API endpoint-okat** - csak újakat add hozzá
3. **NE módosíts meglévő adatbázis mezőket** - csak új mezőket add hozzá
4. **NE törölj régi route-okat** - csak újakat add hozzá

### ✅ MINDIG EZT TÉGY:

1. **Commit minden lépés után** - így könnyen vissza tudsz lépni
2. **Teszteld a régi funkciókat** minden lépés után
3. **Használj feature flag-eket** - új funkciókat könnyen ki tudod kapcsolni
4. **Dokumentáld a változásokat** - mi változott, miért

---

## 🎯 Javasolt Időzítés

### Heti 10-15 óra fejlesztéssel:

- **1. hét:** Lépés 1-3 (Infrastruktúra + Refaktorálás)
- **2. hét:** Lépés 4-5 (Új modellek + API endpoints)
- **3. hét:** Lépés 6 (Frontend bővítés)
- **4. hét:** Lépés 7 + tesztelés (Auth + véglegesítés)

**Összesen: 4 hét** fokozatos fejlesztéssel, miközben a rendszer **minden lépésben működik**.

---

## 🚨 Rollback Terv (Ha Valami Elromlik)

1. **Git revert** az utolsó commit-ra
2. **Adatbázis visszaállítás** a backup-ból
3. **Code review** - mi ment el
4. **Javítás** és újrapróbálás

---

## ✅ Következő Lépés

**Kezdjük a LÉPÉS 1-gyel!** 

Szeretnéd, hogy most elkezdjem implementálni a Lépés 1-et? (Git branch, struktúra előkészítés, backup script)


