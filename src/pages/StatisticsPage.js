import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subWeeks, subMonths, subQuarters } from 'date-fns';

const API_URL = 'https://redluxcrm-7bbed8528713.herokuapp.com/api';

function StatisticsPage() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [period, setPeriod] = useState('monthly');

  const updateDateRange = (newPeriod) => {
    const today = new Date();
    switch (newPeriod) {
      case 'weekly':
        setStartDate(startOfWeek(today));
        setEndDate(endOfWeek(today));
        break;
      case 'monthly':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'quarterly':
        setStartDate(startOfQuarter(today));
        setEndDate(endOfQuarter(today));
        break;
      case 'last_week':
        setStartDate(startOfWeek(subWeeks(today, 1)));
        setEndDate(endOfWeek(subWeeks(today, 1)));
        break;
      case 'last_month':
        setStartDate(startOfMonth(subMonths(today, 1)));
        setEndDate(endOfMonth(subMonths(today, 1)));
        break;
      case 'last_quarter':
        setStartDate(startOfQuarter(subQuarters(today, 1)));
        setEndDate(endOfQuarter(subQuarters(today, 1)));
        break;
      default:
        break;
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/statistics`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period
        }
      });
      console.log('Received statistics:', response.data);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Hiba történt a statisztikák betöltése során.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate, period]);

  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    updateDateRange(newPeriod);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>Statisztikák</Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Kezdő dátum"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Végső dátum"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Időszak</InputLabel>
              <Select
                value={period}
                label="Időszak"
                onChange={handlePeriodChange}
              >
                <MenuItem value="weekly">Ezen a héten</MenuItem>
                <MenuItem value="monthly">Ebben a hónapban</MenuItem>
                <MenuItem value="quarterly">Ebben a negyedévben</MenuItem>
                <MenuItem value="last_week">Múlt héten</MenuItem>
                <MenuItem value="last_month">Múlt hónapban</MenuItem>
                <MenuItem value="last_quarter">Múlt negyedévben</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button variant="contained" onClick={fetchStatistics} sx={{ mb: 3 }}>
          Statisztikák frissítése
        </Button>

        {loading && <CircularProgress />}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {statistics && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Összes árajánlat</Typography>
                    <Typography variant="h4">{statistics.totalQuotes || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Elfogadott árajánlatok</Typography>
                    <Typography variant="h4">{statistics.acceptedQuotes || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Elutasított árajánlatok</Typography>
                    <Typography variant="h4">{statistics.rejectedQuotes || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Összes érték</Typography>
                    <Typography variant="h4">{(statistics.totalValue || 0).toLocaleString()} Ft</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Elfogadott árajánlatok értéke</Typography>
                    <Typography variant="h4">{(statistics.acceptedQuotesValue || 0).toLocaleString()} Ft</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Elfogadási arány</Typography>
                    <Typography variant="h4">
                      {statistics.totalQuotes > 0
                        ? ((statistics.acceptedQuotes / statistics.totalQuotes) * 100).toFixed(2)
                        : 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {statistics.surveyorStats && statistics.surveyorStats.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ p: 2 }}>Felmérők statisztikái</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Felmérő</TableCell>
                      <TableCell align="right">Összes árajánlat</TableCell>
                      <TableCell align="right">Elfogadott árajánlatok</TableCell>
                      <TableCell align="right">Elfogadási arány</TableCell>
                      <TableCell align="right">Összes érték</TableCell>
                      <TableCell align="right">Átlagos érték</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.surveyorStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">{stat.surveyor}</TableCell>
                        <TableCell align="right">{stat.totalQuotes}</TableCell>
                        <TableCell align="right">{stat.acceptedQuotes}</TableCell>
                        <TableCell align="right">{(stat.acceptanceRate * 100).toFixed(2)}%</TableCell>
                        <TableCell align="right">{stat.totalValue.toLocaleString()} Ft</TableCell>
                        <TableCell align="right">{(stat.totalValue / stat.totalQuotes).toLocaleString()} Ft</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </LocalizationProvider>
  );
}

export default StatisticsPage;