const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Puppeteer cache directory beállítása Render.com-on
const cacheDir = process.env.PUPPETEER_CACHE_DIR || (process.env.RENDER ? '/opt/render/.cache/puppeteer' : undefined);
if (cacheDir) {
  process.env.PUPPETEER_CACHE_DIR = cacheDir;
}

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
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    // Ha nincs környezeti változó, próbáljuk meg a Puppeteer default útvonalát
    if (!executablePath) {
      try {
        executablePath = puppeteer.executablePath();
        // Ellenőrizzük, hogy létezik-e a fájl
        if (executablePath && !fsSync.existsSync(executablePath)) {
          console.log(`Chrome not found at ${executablePath}, trying alternatives...`);
          executablePath = undefined;
        } else if (executablePath) {
          console.log(`Found Chrome via Puppeteer at: ${executablePath}`);
        }
      } catch (e) {
        console.log('Error getting Puppeteer executable path:', e.message);
        executablePath = undefined;
      }
    }
    
    // Ha a Puppeteer nem találta meg, próbáljuk meg a cache directory-ben keresni
    if (!executablePath && cacheDir && fsSync.existsSync(cacheDir)) {
      try {
        // Keresünk a cache directory-ben
        const findChromeInDir = (dir) => {
          if (!fsSync.existsSync(dir)) return null;
          const entries = fsSync.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const chromePath = path.join(dir, entry.name, 'chrome-linux64', 'chrome');
              if (fsSync.existsSync(chromePath)) {
                return chromePath;
              }
              // Rekurzívan keresünk
              const subPath = findChromeInDir(path.join(dir, entry.name));
              if (subPath) return subPath;
            }
          }
          return null;
        };
        
        const foundPath = findChromeInDir(cacheDir);
        if (foundPath) {
          console.log(`Found Chrome in cache directory at: ${foundPath}`);
          executablePath = foundPath;
        }
      } catch (e) {
        console.log('Error searching cache directory:', e.message);
      }
    }
    
    // Próbáljuk meg a rendszerben elérhető Chrome-ot (Render.com-on lehet, hogy /usr/bin/google-chrome vagy /usr/bin/chromium-browser)
    if (!executablePath) {
      const possiblePaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/chrome',
        '/snap/bin/chromium'
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fsSync.existsSync(possiblePath)) {
          console.log(`Found system Chrome at: ${possiblePath}`);
          executablePath = possiblePath;
          break;
        }
      }
    }
    
    // Ha még mindig nincs Chrome, próbáljuk meg a node_modules-ben lévőt
    if (!executablePath) {
      const nodeModulesChrome = path.join(__dirname, '../node_modules/puppeteer/.local-chromium');
      if (fsSync.existsSync(nodeModulesChrome)) {
        // Keresünk a chromium mappában
        const chromiumDirs = fsSync.readdirSync(nodeModulesChrome, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        for (const chromiumDir of chromiumDirs) {
          const chromePath = path.join(nodeModulesChrome, chromiumDir, 'chrome-linux64', 'chrome');
          if (fsSync.existsSync(chromePath)) {
            console.log(`Found Chrome in node_modules at: ${chromePath}`);
            executablePath = chromePath;
            break;
          }
        }
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
    
    // Csak akkor adjuk hozzá az executablePath-ot, ha van értéke
    if (executablePath) {
      launchOptions.executablePath = executablePath;
      console.log(`Using Chrome at: ${executablePath}`);
    } else {
      console.log('No explicit Chrome path set, Puppeteer will try to find it automatically');
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