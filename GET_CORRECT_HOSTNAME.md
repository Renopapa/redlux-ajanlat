# Helyes Hostname Megtalálása

## 🔍 Probléma
A `redlux-crm.korvagh.mongodb.net` hostname nem működik (DNS hiba), de a MongoDB Compass-ban/Atlas-ban működik.

## ✅ Megoldás

### 1. MongoDB Compass-ban nézd meg a connection string-et

1. **MongoDB Compass** → **Connect**
2. Nézd meg a **connection string-et**, amit használsz
3. Másold ki a **pontos hostname részt**

### 2. Vagy MongoDB Atlas-ban

1. **MongoDB Atlas Dashboard**
2. **Clusters** → `redlux-crm` cluster
3. **Connect** gomb
4. **Connect your application**
5. Másold ki a **teljes connection string-et**

### 3. Frissítsd a Render.com-on

1. **Render Dashboard** → `redlux-ajanlat` service
2. **Environment** fül
3. `MONGODB_URI` → **Edit**
4. **Másold be a teljes connection string-et** (amit a MongoDB Compass/Atlas mutat)
5. **Save Changes**

## 📝 Fontos

A connection string formátuma:
```
mongodb+srv://redlux-crm:redlux123@[PONTOS_HOSTNAME]/redluxDB?retryWrites=true&w=majority&appName=redluxcrm
```

A `[PONTOS_HOSTNAME]` rész lehet, hogy **nem** `korvagh`, hanem valami más (pl. `abc123`, `xyz789`, stb.)!

## 🚀 Miután frissítetted

A Render automatikusan újra deployol, és működnie kell!

