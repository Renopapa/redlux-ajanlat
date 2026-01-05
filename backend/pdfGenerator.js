const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Puppeteer cache directory beállítása
// A PUPPETEER_CACHE_DIR-t a build script állítja be (/opt/render/project/.cache/puppeteer)
// Ne módosítsuk, hagyjuk, hogy a Puppeteer ezt használja
// A Puppeteer automatikusan megtalálja a Chrome-ot a PUPPETEER_CACHE_DIR-ben

// Handlebars helper-ek regisztrálása
Handlebars.registerHelper('formatNumber', (num) => {
  if (!num) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});

Handlebars.registerHelper('sum', (items, property) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item[property] || 0), 0);
});

Handlebars.registerHelper('multiply', (a, b) => {
  return (a || 0) * (b || 0);
});

Handlebars.registerHelper('divide', (a, b) => {
  if (!b || b === 0) return 0;
  return (a || 0) / b;
});

Handlebars.registerHelper('subtract', (a, b) => {
  return (a || 0) - (b || 0);
});

const generatePDF = async (quoteData) => {
  try {
    const templatePath = path.join(__dirname, 'templates', 'quote-template.html');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
        const enrichedQuoteItems = quoteData.quoteItems.map(item => {
      const discountMultiplier = item.discount ? (1 - item.discount / 100) : 1;
      const originalTotalPrice = item.totalPrice / discountMultiplier;
      const originalUnitPrice = originalTotalPrice / item.quantity;
      const unitAfterDiscount = item.totalPrice / item.quantity;
      
      return {
        ...item,
        originalUnit: originalUnitPrice,
        unitAfterDiscount: unitAfterDiscount,
        originalTotal: originalTotalPrice
      };
    });
    
    // Kiszámítjuk az összesítő értékeket
    const originalTotal = enrichedQuoteItems.reduce((sum, item) => 
      sum + item.originalTotal, 0
    );
    
    const itemDiscountsTotal = enrichedQuoteItems.reduce((sum, item) => 
      sum + (item.originalTotal - item.totalPrice), 0
    );
    
    const subtotal = enrichedQuoteItems.reduce((sum, item) => 
      sum + item.totalPrice, 0
    );
    
    const finalDiscountAmount = subtotal * (quoteData.discount || 0) / 100;
    const finalTotal = subtotal - finalDiscountAmount;
    
    const template = Handlebars.compile(templateContent);
    const html = template({
      ...quoteData,
      quoteItems: enrichedQuoteItems,
      originalTotal,
      itemDiscountsTotal: itemDiscountsTotal > 0 ? itemDiscountsTotal : null,
      finalDiscountAmount,
      finalTotal,
      date: new Date().toLocaleDateString('hu-HU'),
      validUntil: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('hu-HU')
    });

    // Chrome executable path meghatározása
    // A PUPPETEER_CACHE_DIR be van állítva a build script-ben (/opt/render/project/.cache/puppeteer)
    // A Puppeteer automatikusan megtalálja a Chrome-ot, ha a PUPPETEER_CACHE_DIR be van állítva
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    // Ha nincs explicit executable path, használjuk a Puppeteer automatikus keresését
    if (!executablePath) {
      try {
        executablePath = puppeteer.executablePath();
        if (executablePath && fsSync.existsSync(executablePath)) {
          console.log(`Found Chrome via Puppeteer at: ${executablePath}`);
        } else if (executablePath) {
          console.log(`Chrome not found at ${executablePath}, trying system Chrome...`);
          executablePath = undefined;
        }
      } catch (e) {
        console.log('Error getting Puppeteer executable path:', e.message);
        executablePath = undefined;
      }
    }
    
    // Ha a Puppeteer nem találta meg, próbáljuk meg a rendszerben elérhető Chrome-ot
    if (!executablePath) {
      const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chrome',
        '/snap/bin/chromium'
      ];
      
      console.log('Checking for system Chrome/Chromium...');
      for (const possiblePath of possiblePaths) {
        if (fsSync.existsSync(possiblePath)) {
          console.log(`Found system Chrome/Chromium at: ${possiblePath}`);
          executablePath = possiblePath;
          break;
        }
      }
      if (!executablePath) {
        console.log('No system Chrome/Chromium found');
      }
    }
    
    
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--single-process' // Render.com-on néha szükséges
      ]
    };
    
    // Csak akkor adjuk hozzá az executablePath-ot, ha van értéke és létezik
    // Ha nincs, ne adjunk meg executablePath-ot, hagyjuk, hogy a Puppeteer automatikusan keresse
    // A Puppeteer automatikusan próbálja megtalálni a Chrome-ot, de ha nem találja, akkor dob hibát
    // Ebben az esetben a build során kell telepíteni a Chrome-ot
    if (executablePath && fsSync.existsSync(executablePath)) {
      launchOptions.executablePath = executablePath;
      console.log(`Using Chrome at: ${executablePath}`);
    } else {
      console.log('No Chrome path found, Puppeteer will try to find it automatically');
      console.log('If Chrome is not found, make sure it is installed during build with: npx puppeteer browsers install chrome');
      // Ne adjunk meg executablePath-ot, hagyjuk, hogy a Puppeteer automatikusan keresse
    }
    
    const browser = await puppeteer.launch(launchOptions);

    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    return pdf;
    
  } catch (error) {
    console.error('PDF generálási hiba:', error);
    throw error;
  }
};

module.exports = { generatePDF };