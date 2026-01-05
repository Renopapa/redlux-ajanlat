require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { generatePDF } = require('./pdfGenerator');


const app = express();

app.use(cors());
app.use(express.json());

// Statikus fájlok kiszolgálása a production build-ből
app.use(express.static(path.join(__dirname, '../build')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

const quoteSchema = new mongoose.Schema({
  clientName: String,
  clientId: String,
  clientAddress: String,
  clientPhone: String,
  clientEmail: String,
  clientNeeds: String,
  quoteItems: Array,
  total: Number,
  discount: Number,
  status: {
    type: String,
    enum: ['Piszkozat', 'Elküldve', 'Elfogadva', 'Elutasítva'],
    default: 'Piszkozat'
  },
  surveyor: String,
  personalSurvey: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  notes: String,
  originalQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  previousVersions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quote' }]
});

const Quote = mongoose.model('Quote', quoteSchema);

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  basePrice: Number,
  discount: Number,
  unit: String,
  laborCost: Number
});

const Product = mongoose.model('Product', productSchema);

const revenueSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  team: { type: String, required: true },
  cash: { type: Number, default: 0 },
  card: { type: Number, default: 0 },
  transfer: { type: Number, default: 0 },
  expenses: {
    materials: { type: Number, default: 0 },
    fuel: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    salary: { type: Number, default: 0 }
  },
  workHours: { type: Number, default: 0 }
});

const Revenue = mongoose.model('Revenue', revenueSchema);

const companyFinanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  income: {
    advance: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  expenses: {
    orders: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    marketing: { type: Number, default: 0 },
    accounting: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    carExpenses: { type: Number, default: 0 },
    phoneExpenses: { type: Number, default: 0 },
    loanRepayment: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  }
});

const CompanyFinance = mongoose.model('CompanyFinance', companyFinanceSchema);

const generateUniqueClientId = async () => {
  while (true) {
    const clientId = Math.floor(100000 + Math.random() * 900000).toString();
    const existingQuote = await Quote.findOne({ clientId });
    if (!existingQuote) {
      return clientId;
    }
  }
};

const projectSchema = new mongoose.Schema({
  name: String,
  revenue: Number,
  expenses: Number,
  startDate: Date,
  endDate: Date
});

const Project = mongoose.model('Project', projectSchema);

const calculateWeeklyStats = (revenues, companyFinances) => {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalWorkHours = 0;
  const revenueByTeam = {};
  const expensesByType = {};
  const workHoursByTeam = {};

  // Bevételi adatok feldolgozása
  revenues.forEach(rev => {
    const teamRevenue = rev.cash + rev.card + rev.transfer;
    totalRevenue += teamRevenue;
    totalWorkHours += rev.workHours || 0;

    if (!revenueByTeam[rev.team]) revenueByTeam[rev.team] = 0;
    revenueByTeam[rev.team] += teamRevenue;

    if (!workHoursByTeam[rev.team]) workHoursByTeam[rev.team] = 0;
    workHoursByTeam[rev.team] += rev.workHours || 0;

    // Napi költségek feldolgozása
    if (rev.expenses) {
      Object.entries(rev.expenses).forEach(([type, amount]) => {
        totalExpenses += amount || 0;
        if (!expensesByType[type]) expensesByType[type] = 0;
        expensesByType[type] += amount || 0;
      });
    }
  });

  // Céges pénzügyi adatok feldolgozása
  let totalAdvance = 0;
  let totalOtherIncome = 0;
  let totalMaterialOrders = 0;
  let totalUnexpectedExpenses = 0;

  companyFinances.forEach(finance => {
    if (finance.income) {
      totalAdvance += finance.income.advance || 0;
      totalOtherIncome += finance.income.other || 0;
      totalRevenue += (finance.income.advance || 0) + (finance.income.other || 0);
    }

    if (finance.expenses) {
      totalMaterialOrders += finance.expenses.orders || 0;
      totalUnexpectedExpenses += finance.expenses.unexpected || 0;
      totalExpenses += (finance.expenses.orders || 0) + (finance.expenses.unexpected || 0);

      ['rent', 'utilities', 'insurance', 'accounting', 'marketing', 'loanRepayment', 'taxes', 'carExpenses', 'phoneExpenses', 'contributions', 'other'].forEach(expType => {
        if (finance.expenses[expType]) {
          totalExpenses += finance.expenses[expType];
          if (!expensesByType[expType]) expensesByType[expType] = 0;
          expensesByType[expType] += finance.expenses[expType];
        }
      });
    }
  });

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalWorkHours,
    revenueByTeam,
    expensesByType,
    workHoursByTeam,
    totalAdvance,
    totalOtherIncome,
    totalMaterialOrders,
    totalUnexpectedExpenses
  };
};

const calculateMonthlyStats = (revenues, companyFinances) => {
  return calculateWeeklyStats(revenues, companyFinances);
};

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/api/quotes', async (req, res) => {
  try {
    let quoteData = req.body;
    if (!quoteData.clientId) {
      quoteData.clientId = await generateUniqueClientId();
    }
    const newQuote = new Quote({
      ...quoteData,
      version: 1,
      originalQuoteId: null,
      surveyor: quoteData.surveyor, // Add this line
      personalSurvey: quoteData.personalSurvey // Add this line
    });
    
    await newQuote.save();
    res.status(201).json({ quote: newQuote, versions: [newQuote] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Árajánlat nem található' });
    }
    
    const rootQuoteId = quote.originalQuoteId || quote._id;
    const versions = await Quote.find({ 
      $or: [{ _id: rootQuoteId }, { originalQuoteId: rootQuoteId }] 
    }).sort({ version: -1 });
    
    res.json({ quote, versions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Módosítsuk a PUT /api/quotes/:id végpontot
app.put('/api/quotes/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const updateData = req.body;

    const originalQuote = await Quote.findById(quoteId);
    if (!originalQuote) {
      return res.status(404).json({ message: 'Árajánlat nem található' });
    }

    const rootQuoteId = originalQuote.originalQuoteId || originalQuote._id;

    const newVersion = new Quote({
      ...originalQuote.toObject(),
      ...updateData,
      _id: new mongoose.Types.ObjectId(),
      version: originalQuote.version + 1,
      createdAt: new Date(),
      originalQuoteId: rootQuoteId,
      previousVersions: [originalQuote._id, ...(originalQuote.previousVersions || [])],
      personalSurvey: updateData.personalSurvey !== undefined ? updateData.personalSurvey : originalQuote.personalSurvey
    });

    await newVersion.save();

    const versions = await Quote.find({ 
      $or: [{ _id: rootQuoteId }, { originalQuoteId: rootQuoteId }] 
    }).sort({ version: -1 });

    res.json({ quote: newVersion, versions });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/quotes/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedQuote) {
      return res.status(404).json({ message: 'Árajánlat nem található' });
    }
    res.json(updatedQuote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Módosítsuk a /api/quotes/:id/versions végpontot
app.get('/api/quotes/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ message: 'Az árajánlat nem található' });
    }

    const rootQuoteId = quote.originalQuoteId || quote._id;
    const versions = await Quote.find({ 
      $or: [{ _id: rootQuoteId }, { originalQuoteId: rootQuoteId }] 
    }).sort({ version: -1 });

    res.json(versions);
  } catch (error) {
    console.error('Error fetching quote versions:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quotes/client/:clientId', async (req, res) => {
  try {
    const quotes = await Quote.find({ clientId: req.params.clientId }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/generate-client-id', async (req, res) => {
  try {
    const clientId = await generateUniqueClientId();
    res.json({ clientId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Termék nem található' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Termék nem található' });
    }
    res.json({ message: 'Termék sikeresen törölve' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    const quoteStats = await Quote.aggregate([
      { 
        $match: { 
          createdAt: { $gte: start, $lte: end },
          personalSurvey: true
        } 
      },
      { 
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: { $ifNull: ["$originalQuoteId", "$_id"] },
          latestQuote: { $first: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          quoteData: "$latestQuote",
          isAccepted: { $eq: ["$latestQuote.status", "Elfogadva"] },
          isRejected: { $eq: ["$latestQuote.status", "Elutasítva"] }
        }
      },
      {
        $group: {
          _id: null,
          totalQuotes: { $sum: 1 },
          acceptedQuotes: { $sum: { $cond: ["$isAccepted", 1, 0] } },
          rejectedQuotes: { $sum: { $cond: ["$isRejected", 1, 0] } },
          totalValue: { $sum: "$quoteData.total" },
          acceptedQuotesValue: { $sum: { $cond: ["$isAccepted", "$quoteData.total", 0] } },
          surveyorStats: { 
            $push: { 
              surveyor: "$quoteData.surveyor", 
              total: "$quoteData.total", 
              isAccepted: "$isAccepted"
            } 
          }
        }
      }
    ]);
    const stats = quoteStats[0] || {
      totalQuotes: 0,
      acceptedQuotes: 0,
      rejectedQuotes: 0,
      totalValue: 0,
      acceptedQuotesValue: 0,
      surveyorStats: []
    };

    const surveyorStats = stats.surveyorStats.reduce((acc, quote) => {
      const surveyor = quote.surveyor;
      if (!acc[surveyor]) {
        acc[surveyor] = { totalQuotes: 0, acceptedQuotes: 0, totalValue: 0 };
      }
      acc[surveyor].totalQuotes++;
      acc[surveyor].acceptedQuotes += quote.isAccepted ? 1 : 0;
      acc[surveyor].totalValue += quote.total;
      return acc;
    }, {});

    const formattedSurveyorStats = Object.entries(surveyorStats).map(([surveyor, data]) => ({
      surveyor,
      totalQuotes: data.totalQuotes,
      acceptedQuotes: data.acceptedQuotes,
      acceptanceRate: data.totalQuotes > 0 ? data.acceptedQuotes / data.totalQuotes : 0,
      totalValue: data.totalValue,
      averageValue: data.totalQuotes > 0 ? data.totalValue / data.totalQuotes : 0
    }));

    const result = {
      ...stats,
      surveyorStats: formattedSurveyorStats,
      period
    };

    res.json(result);
  } catch (error) {
    console.error('Error in statistics endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Az /api/revenue POST végpont módosítása
app.post('/api/revenue', async (req, res) => {
  try {
    const { date, revenue, expenses, workHours, companyFinance } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Hiányzó dátum' });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Töröljük a meglévő adatokat erre a napra
    await Revenue.deleteMany({ date: { $gte: startOfDay, $lte: endOfDay } });
    await CompanyFinance.deleteMany({ date: { $gte: startOfDay, $lte: endOfDay } });

    const newRevenues = Object.entries(revenue || {}).map(([team, data]) => ({
      date: new Date(date),
      team,
      cash: Number(data?.cash || 0),
      card: Number(data?.card || 0),
      transfer: Number(data?.transfer || 0),
      expenses: Object.fromEntries(Object.entries(expenses[team] || {}).map(([key, value]) => [key, Number(value) || 0])),
      workHours: Number(workHours[team] || 0)
    }));

    if (newRevenues.length > 0) {
      await Revenue.insertMany(newRevenues);
    }

    if (companyFinance) {
      const newCompanyFinance = new CompanyFinance({
        date: new Date(date),
        income: {
          advance: Number(companyFinance.income?.advance || 0),
          other: Number(companyFinance.income?.other || 0)
        },
        expenses: Object.fromEntries(Object.entries(companyFinance.expenses || {}).map(([key, value]) => [key, Number(value) || 0]))
      });
      await newCompanyFinance.save();
    }

    res.status(201).json({ message: 'Bevételi és céges pénzügyi adatok sikeresen mentve' });
  } catch (error) {
    console.error('Hiba a bevételi adatok mentésekor:', error);
    res.status(400).json({ message: error.message });
  }
});

// 3. Új végpont a havi összehasonlításhoz
app.get('/api/monthly-comparison', async (req, res) => {
  try {
    const monthlyData = await Revenue.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          revenue: { $sum: { $add: ["$cash", "$card", "$transfer"] } },
          expenses: { $sum: { $add: [
            { $sum: { $objectToArray: "$expenses" } },
          ] } },
          workHours: { $sum: "$workHours" }
        }
      }
    ]);

    const companyFinanceData = await CompanyFinance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          irregularIncome: { 
            $sum: { $add: [
              { $ifNull: ["$income.advance", 0] },
              { $ifNull: ["$income.other", 0] }
            ] }
          },
          monthlyExpenses: { 
            $sum: { $add: [
              { $ifNull: ["$expenses.rent", 0] },
              { $ifNull: ["$expenses.utilities", 0] },
              { $ifNull: ["$expenses.insurance", 0] },
              { $ifNull: ["$expenses.accounting", 0] },
              { $ifNull: ["$expenses.marketing", 0] },
              { $ifNull: ["$expenses.loans", 0] },
              { $ifNull: ["$expenses.taxes", 0] },
              { $ifNull: ["$expenses.other", 0] }
            ] }
          },
          materialOrders: { $sum: { $ifNull: ["$expenses.orders", 0] } },
          unexpectedExpenses: { $sum: { $ifNull: ["$expenses.unexpected", 0] } }
        }
      }
    ]);

    const combinedData = monthlyData.map(month => {
      const companyFinance = companyFinanceData.find(cf => cf._id === month._id) || {};
      return {
        month: month._id,
        revenue: month.revenue + (companyFinance.irregularIncome || 0),
        expenses: month.expenses + (companyFinance.monthlyExpenses || 0) + 
                  (companyFinance.materialOrders || 0) + (companyFinance.unexpectedExpenses || 0),
        workHours: month.workHours
      };
    });

    combinedData.sort((a, b) => a.month.localeCompare(b.month));

    combinedData.forEach(month => {
      month.profit = month.revenue - month.expenses;
    });

    res.json(combinedData);
  } catch (error) {
    console.error('Hiba a havi összehasonlító adatok lekérésekor:', error);
    res.status(500).json({ message: error.message });
  }
});

// 4. Új végpont a projektek kezeléséhez
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Hiba a projekt adatok lekérésekor:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Hiba a projekt létrehozásakor:', error);
    res.status(400).json({ message: error.message });
  }
});


app.get('/api/revenue', async (req, res) => {
  try {
    const { date } = req.query;
    console.log('Kért dátum:', date);

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Érvénytelen dátum' });
    }
    
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('Keresési időintervallum:', startOfDay, ' - ', endOfDay);

    const revenues = await Revenue.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const companyFinance = await CompanyFinance.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log('Talált bevételek:', revenues);
    console.log('Talált céges pénzügyek:', companyFinance);

    const formattedData = {
      daily: {
        revenue: {},
        expenses: {},
        workHours: {}
      },
      weekly: { materialOrders: 0 },
      monthly: {
        rent: 0, utilities: 0, insurance: 0, accounting: 0,
        marketing: 0, loans: 0, taxes: 0, other: 0
      },
      irregular: {
        income: { advance: 0, other: 0 },
        expenses: { unexpected: 0 }
      }
    };

    revenues.forEach(rev => {
      formattedData.daily.revenue[rev.team] = { cash: rev.cash, card: rev.card, transfer: rev.transfer };
      formattedData.daily.expenses[rev.team] = rev.expenses;
      formattedData.daily.workHours[rev.team] = rev.workHours;
    });

    if (companyFinance) {
      formattedData.weekly.materialOrders = companyFinance.expenses.orders || 0;
      formattedData.monthly = {
        rent: companyFinance.expenses.rent || 0,
        utilities: companyFinance.expenses.utilities || 0,
        insurance: companyFinance.expenses.insurance || 0,
        accounting: companyFinance.expenses.accounting || 0,
        marketing: companyFinance.expenses.marketing || 0,
        loans: companyFinance.expenses.loanRepayment || 0,
        taxes: companyFinance.expenses.taxes || 0,
        other: companyFinance.expenses.other || 0
      };
      formattedData.irregular = {
        income: companyFinance.income || { advance: 0, other: 0 },
        expenses: { unexpected: companyFinance.expenses.unexpected || 0 }
      };
    }

    console.log('Küldött formázott adatok:', formattedData);
    res.json(formattedData);
  } catch (error) {
    console.error('Hiba a bevételi adatok lekérésekor:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/weekly-stats', async (req, res) => {
  try {
    const { startDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    const revenues = await Revenue.find({
      date: { $gte: start, $lt: end }
    });

    const companyFinances = await CompanyFinance.find({
      date: { $gte: start, $lt: end }
    });

    const stats = calculateWeeklyStats(revenues, companyFinances);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/monthly-stats', async (req, res) => {
  try {
    const { year, month } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const revenues = await Revenue.find({
      date: { $gte: start, $lte: end }
    });

    const companyFinances = await CompanyFinance.find({
      date: { $gte: start, $lte: end }
    });

    const stats = calculateMonthlyStats(revenues, companyFinances);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/generate-pdf', async (req, res) => {
  try {
    const quoteData = req.body;
    const pdfRaw = await generatePDF(quoteData);

    // Normalizálás: legyen belőle Buffer, akkor is ha Uint8Array jön
    const pdf = Buffer.isBuffer(pdfRaw) ? pdfRaw : Buffer.from(pdfRaw);

    if (!pdf || !pdf.length) {
      console.error('PDF üres!');
      return res.status(500).json({ error: 'Üres PDF keletkezett' });
    }

    const filename = `arajanlat_${quoteData?.clientId || 'dokumentum'}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length
    });

    res.end(pdf);
  } catch (error) {
    console.error('PDF route error:', error);
    res.status(500).json({ error: 'PDF generálás sikertelen', details: error.message });
  }
});

// Az /api/financial-summary GET végpont módosítása
app.get('/api/financial-summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Hiányzó kezdő vagy végdátum' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const revenues = await Revenue.find({
      date: { $gte: start, $lte: end }
    });

    const companyFinances = await CompanyFinance.find({
      date: { $gte: start, $lte: end }
    });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalWorkHours = 0;
    const revenueByTeam = {};
    const expensesByType = {};
    const workHoursByTeam = {};

    revenues.forEach(rev => {
      totalRevenue += rev.cash + rev.card + rev.transfer;
      totalWorkHours += rev.workHours;

      if (!revenueByTeam[rev.team]) revenueByTeam[rev.team] = 0;
      revenueByTeam[rev.team] += rev.cash + rev.card + rev.transfer;

      if (!workHoursByTeam[rev.team]) workHoursByTeam[rev.team] = 0;
      workHoursByTeam[rev.team] += rev.workHours;

      Object.entries(rev.expenses).forEach(([type, amount]) => {
        totalExpenses += amount;
        if (!expensesByType[type]) expensesByType[type] = 0;
        expensesByType[type] += amount;
      });
    });

    let totalAdvance = 0;
    let totalOtherIncome = 0;
    let totalMaterialOrders = 0;
    let totalUnexpectedExpenses = 0;

    companyFinances.forEach(finance => {
      if (finance.income) {
        totalAdvance += finance.income.advance || 0;
        totalOtherIncome += finance.income.other || 0;
        totalRevenue += (finance.income.advance || 0) + (finance.income.other || 0);
      }

      if (finance.expenses) {
        totalMaterialOrders += finance.expenses.orders || 0;
        totalUnexpectedExpenses += finance.expenses.unexpected || 0;
        totalExpenses += (finance.expenses.orders || 0) + (finance.expenses.unexpected || 0);

        ['rent', 'utilities', 'insurance', 'accounting', 'marketing', 'loans', 'taxes', 'other'].forEach(expType => {
          if (finance.expenses[expType]) {
            totalExpenses += finance.expenses[expType];
            if (!expensesByType[expType]) expensesByType[expType] = 0;
            expensesByType[expType] += finance.expenses[expType];
          }
        });
      }
    });

    const summary = {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalWorkHours,
      revenueByTeam,
      expensesByType,
      workHoursByTeam,
      totalAdvance,
      totalOtherIncome,
      totalMaterialOrders,
      totalUnexpectedExpenses
    };

    res.json(summary);
  } catch (error) {
    console.error('Hiba az összesítő adatok lekérésekor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Minden más kérést a React alkalmazásra irányítunk
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));