import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import API_URL from '../config/api';

const expenseLabels = {
  materials: 'Anyagköltség',
  fuel: 'Üzemanyag',
  parking: 'Parkolás',
  salary: 'Fizetés'
};

const monthlyExpenseLabels = {
  rent: 'Bérleti díj',
  utilities: 'Rezsi',
  insurance: 'Biztosítás',
  accounting: 'Könyvelés',
  marketing: 'Marketing',
  loans: 'Hitelek',
  taxes: 'Adók',
  other: 'Egyéb'
};

const teams = ['Béla-Tomi', 'Feri-Robi', 'Norbert-Niki'];

const FinancialTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [financialData, setFinancialData] = useState({
    daily: {
      revenue: Object.fromEntries(teams.map(team => [team, { cash: 0, card: 0, transfer: 0 }])),
      expenses: Object.fromEntries(teams.map(team => [team, { materials: 0, fuel: 0, parking: 0, salary: 0 }])),
      workHours: Object.fromEntries(teams.map(team => [team, 0]))
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
  });

  const [view, setView] = useState('input');
  const [summaryData, setSummaryData] = useState(null);
  const [summaryDateRange, setSummaryDateRange] = useState('week');
  const [summaryStartDate, setSummaryStartDate] = useState(startOfWeek(new Date()));
  const [summaryEndDate, setSummaryEndDate] = useState(endOfWeek(new Date()));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [monthlyComparisonData, setMonthlyComparisonData] = useState([]);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    fetchData(selectedDate);
    fetchProjectData();
  }, [selectedDate]);

  useEffect(() => {
    if (view === 'summary') {
      fetchSummaryData();
    }
  }, [view, summaryStartDate, summaryEndDate]);

  const fetchData = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/revenue`, {
        params: { date: date.toISOString() }
      });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Hiba az adatok lekérésekor:', error);
      setSnackbar({ open: true, message: 'Hiba az adatok lekérésekor: ' + error.message, severity: 'error' });
    }
  };

  const fetchSummaryData = async () => {
    try {
      const response = await axios.get(`${API_URL}/financial-summary`, {
        params: {
          startDate: summaryStartDate.toISOString(),
          endDate: summaryEndDate.toISOString()
        }
      });
      setSummaryData(response.data);
    } catch (error) {
      console.error('Hiba az összesítő adatok lekérésekor:', error);
      setSnackbar({ open: true, message: 'Hiba az összesítő adatok lekérésekor: ' + error.message, severity: 'error' });
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjectData(response.data);
    } catch (error) {
      console.error('Hiba a projekt adatok lekérésekor:', error);
      setSnackbar({ open: true, message: 'Hiba a projekt adatok lekérésekor: ' + error.message, severity: 'error' });
    }
  };

  const handleDataChange = (category, subCategory, team, field, value) => {
    setFinancialData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (category === 'daily') {
        if (!newData[category][subCategory][team]) {
          newData[category][subCategory][team] = {};
        }
        newData[category][subCategory][team][field] = value === '' ? 0 : Number(value);
      } else if (category === 'irregular') {
        if (!newData[category][subCategory]) {
          newData[category][subCategory] = {};
        }
        newData[category][subCategory][field] = value === '' ? 0 : Number(value);
      } else if (category === 'monthly' || category === 'weekly') {
        newData[category][field] = value === '' ? 0 : Number(value);
      }
      return newData;
    });
  };

  const handleSimpleDataChange = (category, field, value) => {
    setFinancialData(prevData => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: Number(value)
      }
    }));
  };

  const saveData = async () => {
    try {
      const dataToSend = {
        date: selectedDate.toISOString(),
        revenue: financialData.daily.revenue,
        expenses: financialData.daily.expenses,
        workHours: financialData.daily.workHours,
        companyFinance: {
          income: {
            advance: Number(financialData.irregular.income.advance) || 0,
            other: Number(financialData.irregular.income.other) || 0
          },
          expenses: {
            ...Object.fromEntries(
              Object.entries(financialData.monthly).map(([key, value]) => [key, Number(value) || 0])
            ),
            orders: Number(financialData.weekly.materialOrders) || 0,
            unexpected: Number(financialData.irregular.expenses.unexpected) || 0
          }
        }
      };
  
      console.log('Küldendő adatok:', JSON.stringify(dataToSend, null, 2));
  
      const response = await axios.post(`${API_URL}/revenue`, dataToSend);
      console.log('Szerver válasza:', response.data);
  
      setSnackbar({ open: true, message: 'Adatok sikeresen mentve!', severity: 'success' });
      
      fetchData(selectedDate);
    } catch (error) {
      console.error('Hiba az adatok mentésekor:', error);
      if (error.response) {
        console.error('Szerver válasza:', error.response.data);
      }
      setSnackbar({ open: true, message: 'Hiba történt a mentés során: ' + (error.response?.data?.message || error.message), severity: 'error' });
    }
  };

  const handleSummaryDateRangeChange = (range) => {
    setSummaryDateRange(range);
    const today = new Date();
    switch (range) {
      case 'week':
        setSummaryStartDate(startOfWeek(today));
        setSummaryEndDate(endOfWeek(today));
        break;
      case 'month':
        setSummaryStartDate(startOfMonth(today));
        setSummaryEndDate(endOfMonth(today));
        break;
      case 'quarter':
        setSummaryStartDate(subMonths(startOfMonth(today), 2));
        setSummaryEndDate(endOfMonth(today));
        break;
      case 'year':
        setSummaryStartDate(subMonths(startOfMonth(today), 11));
        setSummaryEndDate(endOfMonth(today));
        break;
      default:
        break;
    }
  };

  const fetchMonthlyComparisonData = async () => {
    try {
      const response = await axios.get(`${API_URL}/monthly-comparison`);
      setMonthlyComparisonData(response.data);
    } catch (error) {
      console.error('Hiba a havi összehasonlító adatok lekérésekor:', error);
      setSnackbar({ open: true, message: 'Hiba a havi összehasonlító adatok lekérésekor: ' + error.message, severity: 'error' });
    }
  };

  const renderDailyData = () => {
    return (
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} sm={4} key={team}>
            <Paper elevation={3} style={{ padding: '16px' }}>
              <Typography variant="h6">{team}</Typography>
              {['cash', 'card', 'transfer'].map((type) => (
                <TextField
                  key={type}
                  label={type === 'cash' ? 'Készpénz' : type === 'card' ? 'Bankkártya' : 'Utalás'}
                  type="number"
                  value={financialData.daily.revenue[team]?.[type] ?? ''}
                  onChange={(e) => handleDataChange('daily', 'revenue', team, type, e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              ))}
              <TextField
                label="Munkaórák"
                type="number"
                value={financialData.daily.workHours[team] ?? ''}
                onChange={(e) => handleDataChange('daily', 'workHours', team, e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              <Typography variant="h6" style={{ marginTop: '16px' }}>Kiadások</Typography>
              {Object.entries(expenseLabels).map(([expenseType, label]) => (
                <TextField
                  key={expenseType}
                  label={label}
                  type="number"
                  value={financialData.daily.expenses[team]?.[expenseType] ?? ''}
                  onChange={(e) => handleDataChange('daily', 'expenses', team, expenseType, e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderWeeklyData = () => (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h6">Heti Kiadások</Typography>
      <TextField
        label="Anyagrendelés"
        type="number"
        value={financialData.weekly.materialOrders}
        onChange={(e) => handleSimpleDataChange('weekly', 'materialOrders', e.target.value)}
        fullWidth
        margin="normal"
      />
    </Paper>
  );

  const renderMonthlyData = () => (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h6">Havi Költségek</Typography>
      {Object.entries(monthlyExpenseLabels).map(([expenseType, label]) => (
        <TextField
          key={expenseType}
          label={label}
          type="number"
          value={financialData.monthly[expenseType]}
          onChange={(e) => handleSimpleDataChange('monthly', expenseType, e.target.value)}
          fullWidth
          margin="normal"
        />
      ))}
    </Paper>
  );

  const renderIrregularData = () => (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h6">Rendszertelen Bevételek és Kiadások</Typography>
      <TextField
        label="Előleg"
        type="number"
        value={financialData.irregular.income.advance}
        onChange={(e) => handleDataChange('irregular', 'income', null, 'advance', e.target.value)}
        fullWidth
        margin="normal"
        InputProps={{
          inputProps: { min: 0 }
        }}
      />
      <TextField
        label="Egyéb bevétel"
        type="number"
        value={financialData.irregular.income.other}
        onChange={(e) => handleDataChange('irregular', 'income', null, 'other', e.target.value)}
        fullWidth
        margin="normal"
        InputProps={{
          inputProps: { min: 0 }
        }}
      />
      <TextField
        label="Váratlan kiadás"
        type="number"
        value={financialData.irregular.expenses.unexpected}
        onChange={(e) => handleDataChange('irregular', 'expenses', null, 'unexpected', e.target.value)}
        fullWidth
        margin="normal"
        InputProps={{
          inputProps: { min: 0 }
        }}
      />
    </Paper>
  );

  const renderSummary = () => {
    if (!summaryData) return <Typography>Nincs elérhető adat</Typography>;
  
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Összesített bevétel: {summaryData.totalRevenue.toLocaleString()} Ft</Typography>
            <Typography variant="h6">Összesített kiadás: {summaryData.totalExpenses.toLocaleString()} Ft</Typography>
            <Typography variant="h6">Nettó eredmény: {summaryData.netProfit.toLocaleString()} Ft</Typography>
            <Typography variant="h6">Összes munkaóra: {summaryData.totalWorkHours} óra</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Bevételek részletezése</Typography>
            {Object.entries(summaryData.revenueByTeam).map(([team, revenue]) => (
              <Typography key={team}>{team}: {revenue.toLocaleString()} Ft</Typography>
            ))}
            <Typography>Előlegek: {summaryData.totalAdvance.toLocaleString()} Ft</Typography>
            <Typography>Egyéb bevételek: {summaryData.totalOtherIncome.toLocaleString()} Ft</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Kiadások részletezése</Typography>
            {Object.entries(summaryData.expensesByType).map(([type, expense]) => (
              <Typography key={type}>{expenseLabels[type] || monthlyExpenseLabels[type] || type}: {expense.toLocaleString()} Ft</Typography>
            ))}
            <Typography>Anyagrendelések: {summaryData.totalMaterialOrders.toLocaleString()} Ft</Typography>
            <Typography>Váratlan kiadások: {summaryData.totalUnexpectedExpenses.toLocaleString()} Ft</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Munkaórák csapatonként</Typography>
            {Object.entries(summaryData.workHoursByTeam).map(([team, hours]) => (
              <Typography key={team}>{team}: {hours} óra</Typography>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            <Typography variant="h6">Pénzügyi mutatók</Typography>
            <Typography>Bevétel/munkaóra: {(summaryData.totalRevenue / summaryData.totalWorkHours).toLocaleString()} Ft/óra</Typography>
            <Typography>Profit/munkaóra: {(summaryData.netProfit / summaryData.totalWorkHours).toLocaleString()} Ft/óra</Typography>
            <Typography>Kiadás/bevétel arány: {((summaryData.totalExpenses / summaryData.totalRevenue) * 100).toFixed(2)}%</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderMonthlyComparison = () => {
    return (
      <Paper elevation={3} style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h6">Havi Összehasonlítás</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Bevétel" stroke="#8884d8" />
            <Line type="monotone" dataKey="expenses" name="Kiadás" stroke="#82ca9d" />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    );
  };

  const renderProjectFinances = () => {
    return (
      <Paper elevation={3} style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h6">Projekt Pénzügyek</Typography>
        <List>
          {projectData.map(project => (
            <ListItem key={project.id}>
              <ListItemText
                primary={project.name}
                secondary={`Bevétel: ${project.revenue.toLocaleString()} Ft, Kiadás: ${project.expenses.toLocaleString()} Ft, Profit: ${(project.revenue - project.expenses).toLocaleString()} Ft`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  const renderCashFlowAnalysis = () => {
    if (!summaryData) return null;

    const cashFlow = summaryData.totalRevenue - summaryData.totalExpenses;
    return (
      <Paper elevation={3} style={{ padding: '16px', marginTop: '20px' }}>
        <Typography variant="h6">Cash Flow Elemzés</Typography>
        <Typography>
          Jelenlegi cash flow: {cashFlow.toLocaleString()} Ft
        </Typography>
        <Typography>
          Cash flow státusz: {cashFlow >= 0 ? 'Pozitív' : 'Negatív'}
        </Typography>
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>Pénzügyi Követő</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setView(view === 'input' ? 'summary' : 'input')}
          style={{ marginBottom: '20px', marginRight: '10px' }}
        >
          {view === 'input' ? 'Összesítés megtekintése' : 'Vissza a bevitelhez'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={fetchMonthlyComparisonData}
          style={{ marginBottom: '20px' }}
        >
          Havi összehasonlítás
        </Button>

        {view === 'input' ? (
          <>
            <DatePicker
              label="Dátum választása"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                fetchData(newDate);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} style={{ marginTop: '20px' }}>
              <Tab label="Napi" />
              <Tab label="Heti" />
              <Tab label="Havi" />
              <Tab label="Rendszertelen" />
            </Tabs>
            
            <Box sx={{ padding: 2 }}>
              {activeTab === 0 && renderDailyData()}
              {activeTab === 1 && renderWeeklyData()}
              {activeTab === 2 && renderMonthlyData()}
              {activeTab === 3 && renderIrregularData()}
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveData} 
              style={{ marginTop: '20px' }}
            >
              Adatok mentése
            </Button>
          </>
        ) : (
          <>
            <FormControl fullWidth style={{ marginBottom: '20px' }}>
              <InputLabel>Időintervallum</InputLabel>
              <Select
                value={summaryDateRange}
                onChange={(e) => handleSummaryDateRangeChange(e.target.value)}
              >
                <MenuItem value="week">Heti</MenuItem>
                <MenuItem value="month">Havi</MenuItem>
                <MenuItem value="quarter">Negyedéves</MenuItem>
                <MenuItem value="year">Éves</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2} style={{ marginBottom: '20px' }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Kezdő dátum"
                  value={summaryStartDate}
                  onChange={(newDate) => setSummaryStartDate(newDate)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Végző dátum"
                  value={summaryEndDate}
                  onChange={(newDate) => setSummaryEndDate(newDate)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
            {renderSummary()}
            {renderCashFlowAnalysis()}
            {renderProjectFinances()}
            {renderMonthlyComparison()}
          </>
        )}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default FinancialTracker;  