const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

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
    // Render.com-on vagy használjuk a környezeti változót, vagy automatikusan keressük meg
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    // Ha nincs környezeti változó, próbáljuk meg a Puppeteer default útvonalát
    if (!executablePath) {
      try {
        executablePath = puppeteer.executablePath();
        // Ellenőrizzük, hogy létezik-e a fájl
        if (!fsSync.existsSync(executablePath)) {
          executablePath = undefined; // Ha nem létezik, hagyjuk, hogy automatikusan keresse
        }
      } catch (e) {
        executablePath = undefined; // Ha hiba van, hagyjuk, hogy automatikusan keresse
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
        '--disable-extensions'
      ]
    };
    
    // Csak akkor adjuk hozzá az executablePath-ot, ha van értéke
    if (executablePath) {
      launchOptions.executablePath = executablePath;
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