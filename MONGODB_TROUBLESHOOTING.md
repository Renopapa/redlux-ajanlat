# MongoDB Connection Troubleshooting

## ✅ Helyes Connection String (appName nélkül is működik)

```
mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redluxcrm
```

Vagy ha nem akarod az appName-et:
```
mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority
```

## 🔍 Az appName nem okoz authentication hibát

Az `appName` csak egy opcionális paraméter, amit a MongoDB Atlas monitoring-ban látsz. **Nem befolyásolja az autentikációt.**

## ⚠️ Valódi problémák lehetnek:

### 1. Network Access (Legvalószínűbb!)
A MongoDB Atlas-ban engedélyezned kell a Render.com IP címeket:

1. MongoDB Atlas Dashboard
2. **Network Access** (bal oldali menü)
3. **Add IP Address**
4. Válaszd: **"Allow Access from Anywhere"** → `0.0.0.0/0`
5. Vagy add hozzá a Render.com IP címeket

### 2. Database User
Ellenőrizd, hogy létezik-e a `redlux-crm` felhasználó:

1. MongoDB Atlas Dashboard
2. **Database Access** (bal oldali menü)
3. Nézd meg, hogy van-e `redlux-crm` felhasználó
4. Ha nincs, hozd létre ugyanazzal a jelszóval

### 3. Jelszó URL Encoding
Ha a jelszó speciális karaktereket tartalmaz, URL-encode-olni kell:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- stb.

De ha a jelszó csak `redlux123`, akkor nincs szükség encoding-ra.

## 🚀 Tesztelés

Próbáld ki lokálisan is ezt a connection string-et:
```bash
node -e "require('mongoose').connect('mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority').then(() => console.log('OK')).catch(e => console.error(e))"
```

Ha lokálisan sem működik, akkor a probléma:
- Network Access
- Vagy a felhasználó/jelszó nem jó

