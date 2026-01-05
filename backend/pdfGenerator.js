const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Puppeteer cache directory beállítása
// Ha nincs megadva PUPPETEER_CACHE_DIR, a Puppeteer a node_modules/puppeteer/.local-chromium mappát használja
// Ez a mappa perzisztens a Render.com-on, mert a node_modules része a build-nek
const cacheDir = process.env.PUPPETEER_CACHE_DIR;
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
    
    // Először próbáljuk meg a node_modules-ben lévőt (ez a legbiztosabb, mert perzisztens)
    if (!executablePath) {
      const nodeModulesChrome = path.join(__dirname, '../node_modules/puppeteer/.local-chromium');
      if (fsSync.existsSync(nodeModulesChrome)) {
        try {
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
        } catch (e) {
          console.log(`Error reading node_modules chromium directory: ${e.message}`);
        }
      }
    }
    
    // Ha nincs környezeti változó és node_modules-ben sem található, próbáljuk meg a Puppeteer default útvonalát
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
    // A render-build.sh script a Chrome-ot a /opt/render/.cache/puppeteer/chrome/ mappába telepíti
    if (!executablePath && cacheDir) {
      try {
        console.log(`Searching for Chrome in cache directory: ${cacheDir}`);
        console.log(`Cache directory exists: ${fsSync.existsSync(cacheDir)}`);
        
        // Ellenőrizzük, hogy a cache directory létezik-e
        if (!fsSync.existsSync(cacheDir)) {
          console.log(`Cache directory does not exist, creating: ${cacheDir}`);
          fsSync.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Először próbáljuk meg a közvetlen útvonalat, amit a Puppeteer ad vissza
        // De dinamikusan keressük a verziót, ne fix verzióval
        const chromeVersionsDir = path.join(cacheDir, 'chrome');
        if (fsSync.existsSync(chromeVersionsDir)) {
          try {
            // Keresünk minden verzió mappában
            const versionDirs = fsSync.readdirSync(chromeVersionsDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name);
            
            for (const versionDir of versionDirs) {
              const chromePath = path.join(chromeVersionsDir, versionDir, 'chrome-linux64', 'chrome');
              if (fsSync.existsSync(chromePath)) {
                console.log(`Found Chrome at: ${chromePath}`);
                executablePath = chromePath;
                break;
              }
            }
          } catch (e) {
            console.log(`Error reading chrome versions directory: ${e.message}`);
          }
        }
        
        if (!executablePath) {
          // Ha nem található, keresünk a cache directory-ben
          const chromeCacheDir = path.join(cacheDir, 'chrome');
          if (fsSync.existsSync(chromeCacheDir)) {
            console.log(`Searching in chrome cache directory: ${chromeCacheDir}`);
            
            const findChromeInDir = (dir, depth = 0) => {
              if (depth > 5) return null; // Max 5 szint mélység
              if (!fsSync.existsSync(dir)) return null;
              
              try {
                const entries = fsSync.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                  const fullPath = path.join(dir, entry.name);
                  
                  // Ha találunk egy 'chrome' fájlt, az lehet a Chrome executable
                  if (entry.isFile() && entry.name === 'chrome') {
                    // Ellenőrizzük, hogy létezik-e
                    if (fsSync.existsSync(fullPath)) {
                      console.log(`Found Chrome file at: ${fullPath}`);
                      return fullPath;
                    }
                  }
                  
                  // Ha mappa, keresünk benne
                  if (entry.isDirectory()) {
                    // Próbáljuk meg a chrome-linux64/chrome útvonalat
                    const chromePath = path.join(fullPath, 'chrome-linux64', 'chrome');
                    if (fsSync.existsSync(chromePath)) {
                      console.log(`Found Chrome at: ${chromePath}`);
                      return chromePath;
                    }
                    
                    // Rekurzívan keresünk
                    const subPath = findChromeInDir(fullPath, depth + 1);
                    if (subPath) return subPath;
                  }
                }
              } catch (e) {
                console.log(`Error reading directory ${dir}:`, e.message);
                return null;
              }
              return null;
            };
            
            const foundPath = findChromeInDir(chromeCacheDir);
            if (foundPath) {
              console.log(`Found Chrome in cache directory at: ${foundPath}`);
              executablePath = foundPath;
            } else {
              console.log(`Chrome not found in cache directory: ${chromeCacheDir}`);
            }
          } else {
            console.log(`Chrome cache directory does not exist: ${chromeCacheDir}`);
          }
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