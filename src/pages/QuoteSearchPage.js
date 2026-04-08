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
  Alert,
  IconButton,
  ListItemButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

  const handleDelete = async (e, quoteId) => {
    e.stopPropagation();
    if (!window.confirm('Biztosan törlöd ezt az árajánlatot? A művelet nem vonható vissza.')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/quotes/${quoteId}`);
      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
      setSnackbar({ open: true, message: 'Árajánlat törölve.', severity: 'success' });
    } catch (err) {
      console.error('Delete quote error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Nem sikerült törölni az árajánlatot.',
        severity: 'error',
      });
    }
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
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="Árajánlat törlése"
                onClick={(e) => handleDelete(e, quote._id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            }
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              mb: 1,
              pr: 7,
            }}
          >
            <ListItemButton onClick={() => handleQuoteClick(quote._id)}>
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
            </ListItemButton>
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
