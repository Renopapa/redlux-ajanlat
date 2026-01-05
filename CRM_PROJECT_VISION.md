# CRM Rendszer Projekt - Árnyékolástechnikai Vállalkozás

## 📋 Projekt Célok

### Fő cél
**Átfogó CRM rendszer építése** árnyékolástechnikai vállalkozáshoz, amely integrálja a meglévő árajánlat-készítő rendszert és további funkcionalitásokat tartalmaz.

### Jelenlegi állapot
- ✅ **Árajánlat készítő rendszer működik** (`arajanlat-keszito`)
- ✅ Alapvető funkciók:
  - Árajánlat létrehozás és kezelés
  - PDF generálás
  - Termékkezelés
  - Statisztikák
  - Bevétel-költség nyomon követés
- ⚠️ Meglévő rendszer korlátozásokkal (lásd: PROJECT_REVIEW.md)

---

## 🎯 Tervezett CRM Funkciók

### 1. Ügyfélkezelés (Customer Management)
- [ ] Ügyfél adatbázis kiterjesztése
  - Kapcsolattartási információk
  - Kommunikációs előzmények (telefon, email, találkozók)
  - Projektek és szerződések
  - Ügyfél státusz (leads, ügyfelek, ex-ügyfelek)
  - Csillagozás/prioritás
- [ ] Ügyfél felmérések nyomon követése
  - Felmérés dátum és időpont
  - Felmérő hozzárendelés
  - Felmérés eredménye/jegyzetek
  - Következő lépések

### 2. Projekt és Munkafolyamat Kezelés
- [ ] Projektek életciklus kezelése
  - Új megkeresés → Felmérés → Árajánlat → Megrendelés → Kivitelezés → Lezárás
  - Projekt státuszok és követési fázisok
  - Határidők és emlékeztetők
- [ ] Feladatok és To-Do lista
  - Feladatok hozzárendelése felmérőkhöz/munkatársakhoz
  - Prioritások és határidők
  - Értesítések

### 3. Kommunikáció és Dokumentumkezelés
- [ ] Email integráció
  - Email küldés közvetlenül a rendszerből
  - Email előzmények tárolása
  - Email sablonok (árajánlat, megemlékezés, stb.)
- [ ] SMS/Telefon integráció
  - SMS küldés
  - Hívás naplózás
- [ ] Dokumentum tárolás
  - Árajánlatok PDF-jei
  - Szerződések
  - Fényképek (felmérés, kivitelezés)
  - Jegyzetek és megjegyzések

### 4. Árajánlat Készítő Integráció
- [x] Meglévő árajánlat készítő funkciók
- [ ] Továbbfejlesztések:
  - Automatikus követés (mikor küldték el, olvasták-e, válaszoltak-e)
  - Email integrációval való automatikus küldés
  - Sablonok kezelése
  - Tömeges árajánlat generálás

### 5. Bevétel és Pénzügyek
- [x] Alapvető bevétel-költség nyomon követés
- [ ] Továbbfejlesztések:
  - Invoicing (számlázás)
  - Fizetési követés (kiállított számlák, esedékes tételek)
  - Előlegkezelés
  - Számla státuszok
  - Bevétel projektenkénti hozzárendelése

### 6. Munkaszervezés és Csapatkezelés
- [ ] Felmérők és csapat kezelése
  - Felmérők munkájának nyomon követése
  - Csapatok és hozzárendelések
  - Munkabeosztás és naptárak
  - Teljesítmény metrikák felmérőnként
- [ ] Kivitelező csapatok kezelése
  - Csapatok hozzárendelése projektekhez
  - Munkafolyamatok kivitelezéshez

### 7. Jelentések és Analitika
- [x] Alapvető statisztikák
- [ ] Továbbfejlesztések:
  - Konverziós arányok (leads → ügyfelek)
  - Felmérő teljesítmény
  - Projekt típusok szerinti elemzés
  - Időszakos összehasonlítások
  - Profitabilitás elemzés
  - Dashboard valós idejű adatokkal

### 8. Mobil App
- [ ] Mobil alkalmazás vagy responsive design
  - Felmérés közbeni adatrögzítés
  - Képfeltöltés
  - Offline mód támogatás
  - Push értesítések

---

## 🏗️ Technológiai Tervek

### Jelenlegi Stack
- **Frontend:** React + Material-UI
- **Backend:** Node.js + Express
- **Adatbázis:** MongoDB
- **PDF generálás:** Puppeteer

### Tervezett Bővítések
- [ ] **Autentikáció és Authorization**
  - JWT alapú bejelentkezés
  - Szerepkörök (admin, felmérő, kivitelező, pénzügy)
  - Felhasználó kezelés
  
- [ ] **Email szolgáltatás integráció**
  - SendGrid vagy Nodemailer
  - Email sablonok
  
- [ ] **Fájl tárolás**
  - Cloud Storage (AWS S3, Google Cloud Storage)
  - Vagy helyi tárolás optimalizálása
  
- [ ] **Real-time funkciók** (opcionális)
  - WebSocket integráció
  - Értesítések valós időben
  
- [ ] **API dokumentáció**
  - Swagger/OpenAPI
  
- [ ] **Tesztelés**
  - Unit tesztek
  - Integration tesztek

---

## 📐 Architektúra Tervek

### Javasolt Mappa Struktúra
```
crm-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Általános komponensek
│   │   │   ├── customers/       # Ügyfél kezelés
│   │   │   ├── projects/        # Projekt kezelés
│   │   │   ├── quotes/          # Árajánlat (meglévő)
│   │   │   ├── invoices/        # Számlázás
│   │   │   └── dashboard/       # Dashboard
│   │   ├── pages/
│   │   ├── services/            # API hívások
│   │   ├── context/             # Context API (auth, stb.)
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── models/              # MongoDB modellek
│   │   │   ├── User.js
│   │   │   ├── Customer.js
│   │   │   ├── Project.js
│   │   │   ├── Quote.js         # Meglévő
│   │   │   ├── Invoice.js
│   │   │   └── Task.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── projects.js
│   │   │   ├── quotes.js        # Meglévő
│   │   │   └── invoices.js
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/           # Auth, validation, stb.
│   │   ├── services/            # Email, PDF, stb.
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
└── shared/                      # Közös típusok, konstansok
```

---

## 🚀 Implementációs Roadmap

### Fázis 1: Alapok (1-2 hét)
- [ ] Meglévő árajánlat rendszer integrálása új struktúrába
- [ ] Autentikáció és felhasználókezelés
- [ ] Alapvető ügyfél modell és CRUD műveletek
- [ ] Kód refaktorálás (route separation)

### Fázis 2: Ügyfél és Projekt Kezelés (2-3 hét)
- [ ] Ügyfél adatbázis kiterjesztése
- [ ] Projekt életciklus kezelés
- [ ] Feladatok és To-Do lista
- [ ] Alapvető kommunikációs napló

### Fázis 3: Kommunikáció (1-2 hét)
- [ ] Email integráció
- [ ] Email sablonok
- [ ] Dokumentum kezelés
- [ ] SMS integráció (opcionális)

### Fázis 4: Pénzügyek (1-2 hét)
- [ ] Számlázás modul
- [ ] Fizetési követés
- [ ] Bevétel-költség továbbfejlesztés

### Fázis 5: Analitika és Jelentések (1 hét)
- [ ] Dashboard
- [ ] Speciális jelentések
- [ ] Export funkciók

### Fázis 6: Optimalizálás és Tesztelés (1-2 hét)
- [ ] Teljesítmény optimalizálás
- [ ] Biztonsági audit
- [ ] Tesztek írása
- [ ] Dokumentáció

---

## 💡 Fontos Megjegyzések

### Meglévő Rendszer Integrációja
- Az aktuális `arajanlat-keszito` projekt **szerves része lesz** az új CRM-nek
- Fontos, hogy a meglévő adatok migrálhatóak legyenek
- A meglévő funkcionalitást meg kell tartani, csak kiterjeszteni

### Adatbázis Séma Kiterjesztések
- Quote modell bővítése ügyfél kapcsolattal
- Customer modell új mezőkkel
- Project modell a munkafolyamat követéshez
- Task modell feladatokhoz
- Invoice modell számlázáshoz

### Biztonság
- Autentikáció kötelező
- Role-based access control (RBAC)
- Adatvédelmi megfontolások (GDPR)
- Biztonságos fájl tárolás

---

## 📝 Jelenlegi Problémák Megoldása

A `PROJECT_REVIEW.md`-ben leírt problémák megoldása része lesz az új CRM fejlesztésének:

- ✅ Hiányzó függvények implementálása (már javítva)
- ⏳ API URL környezeti változóba helyezése
- ⏳ CORS beállítások javítása
- ⏳ Backend validáció
- ⏳ Kód refaktorálás (route separation)
- ⏳ Pagination
- ⏳ Error handling

---

## 🎯 Végcél

**Egy komplett, integrált CRM rendszer**, amely:
- Minden ügyfél információt egy helyen tart
- Nyomon követi az összes projektet és munkafolyamatot
- Segít a kommunikációban
- Segít a pénzügyek kezelésében
- Statisztikákat és jelentéseket biztosít
- Könnyen használható és karbantartható

---

## 📅 Dokumentum információk

**Létrehozva:** 2024  
**Projekt neve:** CRM Rendszer - Árnyékolástechnikai Vállalkozás  
**Státusz:** Tervezési fázis  
**Következő lépés:** Alapok implementálása (Fázis 1)

---

*Ez a dokumentum élő dokumentum, amit folyamatosan frissítünk a projekt haladtával.*


