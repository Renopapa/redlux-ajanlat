# MongoDB URI Frissítés - Render.com

## 🚨 Probléma
A Render.com-on beállított MongoDB URI egy másik (üres) adatbázisra mutat, nem arra, ahol a 182 termék van.

## ✅ Megoldás

### 1. Render.com Dashboard

1. Menj: https://dashboard.render.com
2. Kattints a **`redlux-ajanlat`** service-re
3. Kattints a **"Environment"** fülre
4. Keresd meg a **`MONGODB_URI`** environment variable-t
5. Kattints a **"Edit"** gombra

### 2. Új Connection String

**RÉGI (töröld vagy frissítsd):**
```
mongodb+srv://redluxCRM:redlux123@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM
```

**ÚJ (cseréld le erre - DE előbb add meg a jelszót!):**
```
mongodb+srv://redlux-crm:<DB_PASSWORD>@redlux-crm.k0rvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redlux-crm
```

**Fontos:** Cseréld le a `<DB_PASSWORD>`-t a valódi jelszóra!

### 3. Adatbázis név ellenőrzése

A connection string-ben a `/redluxDB` rész az adatbázis neve. Ha a termékek másik adatbázisban vannak, cseréld le!

Példa, ha a termékek a `redlux-crm` adatbázisban vannak:
```
mongodb+srv://redlux-crm:<DB_PASSWORD>@redlux-crm.k0rvagh.mongodb.net/redlux-crm?retryWrites=true&w=majority&appName=redlux-crm
```

### 4. Mentés és Újra Deploy

1. Kattints **"Save Changes"**
2. Render automatikusan újra deployol
3. Várj 1-2 percet
4. Frissítsd az oldalt

---

## 🔍 Hogyan találod meg a helyes adatbázis nevét?

A MongoDB Compass-ban:
1. Nézd meg, hogy melyik adatbázisban vannak a termékek
2. A connection string-ben a `/adatbazis-neve` rész az adatbázis neve
3. Példa: ha `redluxDB`-ben vannak → `/redluxDB`
4. Ha `redlux-crm`-ben vannak → `/redlux-crm`

---

## ⚠️ Fontos

- A jelszót ne oszd meg senkivel!
- A connection string tartalmazza a jelszót
- Csak a Render.com environment variable-ban legyen

