# MongoDB URI Javítás - Render.com

## ✅ Helyes Connection String

Frissítsd a Render.com-on a `MONGODB_URI` environment variable-t erre:

```
mongodb+srv://redluxCRM:redlux123@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM
```

## 🔍 Miért ez?

- ✅ **Eredeti connection string** - lokálisan működött
- ✅ **Helyes felhasználónév**: `redluxCRM` (nem `redlux-crm`)
- ✅ **Helyes cluster**: `evoxfzk` (nem `korvagh`)
- ✅ **Teljes paraméterek**: `retryWrites=true&w=majority`

## 📝 Lépések

1. Render Dashboard → `redlux-ajanlat` service
2. Environment fül
3. `MONGODB_URI` → Edit
4. Másold be a fenti connection string-et
5. Save Changes
6. Várj 1-2 percet az újra deploy-ra

## ⚠️ Ha még mindig nem működik

Ellenőrizd a MongoDB Atlas-ban:
1. **Database Access** → Létezik-e a `redluxCRM` felhasználó?
2. **Network Access** → Engedélyezve van-e `0.0.0.0/0` (vagy Render IP-k)?

