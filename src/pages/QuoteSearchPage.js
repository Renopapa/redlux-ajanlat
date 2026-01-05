import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Snackbar,
  Alert
} from '@mui/material';

import API_URL from '../config/api';

function QuoteSearchPage() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotes`);
      setQuotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Hiba történt az árajánlatok betöltése során.');
      setLoading(false);
      setSnackbar({ open: true, message: 'Hiba történt az árajánlatok betöltése során.', severity: 'error' });
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    (quote.clientName && quote.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (quote.clientId && quote.clientId.toString().includes(searchTerm))
  );

  const handleQuoteClick = (quoteId) => {
    navigate(`/quote/${quoteId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Árajánlatok keresése</Typography>
      <TextField
        fullWidth
        label="Keresés ügyfél neve vagy azonosító alapján"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        variant="outlined"
      />
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      <List sx={{ mt: 2 }}>
        {filteredQuotes.map((quote) => (
          <ListItem 
            key={quote._id} 
            button 
            onClick={() => handleQuoteClick(quote._id)}
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '4px', 
              mb: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle1">
                  {`${quote.clientName || 'Névtelen ügyfél'} - ${quote.clientId || 'Nincs azonosító'}`}
                </Typography>
              }
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {`Összeg: ${quote.total ? quote.total.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' }) : '0 Ft'}`}
                  </Typography>
                  {` - Státusz: ${quote.status || 'Nincs státusz'}`}
                  <br />
                  {`Verzió: ${quote.version || '1'} - Létrehozva: ${new Date(quote.createdAt).toLocaleDateString('hu-HU')}`}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
      {filteredQuotes.length === 0 && (
        <Typography sx={{ mt: 2 }}>Nincs találat a keresési feltételeknek megfelelően.</Typography>
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
    </Paper>
  );
}

export default QuoteSearchPage;