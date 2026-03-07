## Publikus árajánlat kalkulátor – beágyazási példa

### 1. Iframe-es beágyazás (jelenleg legegyszerűbb)

Miután a frontendben elérhető a `/public-calculator` útvonal, bármely WordPress / landing oldalra beillesztheted így:

```html
<iframe
  src="https://SAJAT-DOMENED.hu/public-calculator"
  style="width: 100%; max-width: 520px; height: 720px; border: none; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);"
  loading="lazy"
></iframe>
```

- **Szélesség**: a konténerhez igazodik (`width: 100%`, `max-width: 520px`),
- **Magasság**: igény szerint állítható a `height` érték módosításával.

### 2. Script-alapú beágyazás (init függvénnyel)

A kódban elérhető egy `initPublicQuoteCalculator` függvény (`src/embed/publicCalculatorEmbed.js`), amelyet egy külön bundle-be csomagolva így lehetne használni:

```html
<div id="my-quote-calculator"></div>
<script src="https://SAJAT-DOMENED.hu/public-calculator.js" async></script>
<script>
  window.addEventListener('load', function () {
    if (window.initPublicQuoteCalculator) {
      window.initPublicQuoteCalculator('#my-quote-calculator', {
        primaryColor: '#e53535',
        accentColor: '#ffb347',
        borderRadius: 16
      });
    }
  });
</script>
```

Ennél a megoldásnál a build/bundle konfigurációban kell gondoskodni arról, hogy a `initPublicQuoteCalculator` függvényt exportáló JS fájl `public-calculator.js` néven elérhető legyen a szerveren.

