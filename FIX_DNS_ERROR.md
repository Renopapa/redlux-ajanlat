# DNS Hiba Javítás - MongoDB Connection String

## 🚨 Hiba
```
querySrv ENOTFOUND _mongodb._tcp.redlux-crm.korvagh.mongodb.net
```

Ez azt jelenti, hogy a **hostname nem helyes** a connection string-ben!

## ✅ Megoldás

### 1. MongoDB Atlas-ban nézd meg a pontos hostname-t

1. **MongoDB Atlas Dashboard**
2. **Clusters** (bal oldali menü)
3. Kattints a **`redlux-crm`** cluster-re
4. **Connect** gomb
5. **Connect your application**
6. Másold ki a **pontos hostname-t**

Példa:
```
mongodb+srv://redlux-crm:redlux123@redlux-crm.XXXXX.mongodb.net/...
```

A `XXXXX` rész lehet bármi (pl. `korvagh`, `abc123`, stb.) - **pontosan azt kell használni, amit a MongoDB Atlas mutat!**

### 2. Frissítsd a Render.com-on

1. **Render Dashboard** → `redlux-ajanlat` service
2. **Environment** fül
3. `MONGODB_URI` → **Edit**
4. Cseréld le a hostname részt a **pontos hostname-re** (amit a MongoDB Atlas-ból másoltál)
5. **Save Changes**

## 📝 Példa

Ha a MongoDB Atlas ezt mutatja:
```
mongodb+srv://redlux-crm:<password>@redlux-crm.abc123.mongodb.net/...
```

Akkor a Render.com-on ezt használd:
```
mongodb+srv://redlux-crm:redlux123@redlux-crm.abc123.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redluxcrm
```

**Fontos:** A `korvagh` rész lehet, hogy nem helyes! A MongoDB Atlas-ban nézd meg a pontos hostname-t!

