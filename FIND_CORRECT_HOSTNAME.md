# Helyes Hostname Megtalálása

## 🔍 Probléma
A connection string az Atlas-ból másolva, de DNS hiba van. A hostname valószínűleg rossz.

## ✅ Lépések

### 1. MongoDB Atlas Dashboard

1. **Clusters** (bal oldali menü)
2. Kattints a **`redlux-crm`** cluster-re
3. Nézd meg a **cluster részleteit**

### 2. Connection String másolása

1. **Connect** gomb
2. **Connect your application**
3. **Driver**: Node.js
4. **Version**: legfrissebb
5. **Másold ki a connection string-et**

### 3. Fontos ellenőrzések

- A hostname pontosan ugyanaz, mint amit az Atlas mutat?
- Nincs elírás a hostname-ben? (pl. `korvagh` vs `k0rvagh`)
- A felhasználónév és jelszó helyes?

### 4. Ha még mindig nem működik

Próbáld ki ezeket a variációkat:

```
mongodb+srv://redlux-crm:redlux123@redlux-crm.k0rvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redluxcrm
mongodb+srv://redlux-crm:redlux123@redlux-crm.k0rvagh.mongodb.net/?retryWrites=true&w=majority&appName=redluxcrm
```

**Fontos:** A `k0rvagh` (nulla) vs `korvagh` (O betű) különbség!

