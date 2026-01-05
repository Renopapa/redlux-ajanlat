# ✅ Helyes MongoDB URI - Render.com

## 🔧 Frissítsd a Render.com-on a `MONGODB_URI`-t erre:

```
mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redlux-crm
```

## 📝 Mi változott?

**RÉGI (hiányos):**
```
mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?appName=redlux-crm
```

**ÚJ (teljes):**
```
mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redlux-crm
```

**Hozzáadtam:**
- ✅ `retryWrites=true&w=majority` paramétereket (fontos a MongoDB működéséhez)

## 🚀 Lépések

1. Render Dashboard → `redlux-ajanlat` service
2. **Environment** fül
3. `MONGODB_URI` → **Edit**
4. Másold be a fenti teljes connection string-et
5. **Save Changes**
6. Render automatikusan újra deployol (1-2 perc)

## ⚠️ Ha még mindig "bad auth" hibát kapsz

Ellenőrizd a MongoDB Atlas-ban:

1. **Database Access**:
   - Létezik-e a `redlux-crm` felhasználó?
   - A jelszó biztosan `redlux123`?

2. **Network Access**:
   - Engedélyezve van-e `0.0.0.0/0` (minden IP)?
   - Vagy hozzá kell adni a Render.com IP címeket?

3. **Jelszó URL encoding**:
   - Ha a jelszó speciális karaktereket tartalmaz, URL-encode-olni kell
   - Példa: `@` → `%40`, `#` → `%23`, stb.

