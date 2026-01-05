const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
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

    
const browser = await puppeteer.launch({
  headless: true,
  executablePath: puppeteer.executablePath(),  // <- biztosan az installált Chrome-ot használja
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
});

    
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