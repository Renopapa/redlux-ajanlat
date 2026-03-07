import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Checkbox,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { availableColors } from '../data/productData';
import { calculateQuoteItem } from '../lib/pricingEngine';
import API_URL from '../config/api';

const steps = ['Beállítások', 'Irányár', 'Ajánlatkérés'];

const defaultTheme = {
  primaryColor: '#e53535',
  accentColor: '#ffb347',
  borderRadius: 16,
};

function PublicCalculatorWidget({
  primaryColor = defaultTheme.primaryColor,
  accentColor = defaultTheme.accentColor,
  borderRadius = defaultTheme.borderRadius,
  projectTypeLabel = 'Milyen megoldást keresel?',
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quoteItem, setQuoteItem] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardStyles = useMemo(
    () => ({
      borderRadius,
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      padding: 24,
      border: '1px solid rgba(0,0,0,0.04)',
      background: '#ffffff',
    }),
    [borderRadius]
  );

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products`);
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        const uniqueCategories = [...new Set(list.map((p) => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (e) {
        console.error('Public widget product load error', e);
        setError('Nem sikerült betölteni a termékeket. Kérjük, próbáld meg később.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const total = quoteItem ? quoteItem.totalPrice : 0;
  const minPrice = total > 0 ? Math.round(total * 0.9) : 0;
  const maxPrice = total > 0 ? Math.round(total * 1.1) : 0;

  const handleNext = async () => {
    setError('');
    if (activeStep === 0) {
      if (!selectedCategory || !selectedProduct || !selectedColor || quantity <= 0) {
        setError('Kérjük, válassz terméket, színt és mennyiséget.');
        return;
      }
      if (selectedProduct.unit === 'm2' && (!width || !height)) {
        setError('Kérjük, add meg a szélességet és magasságot.');
        return;
      }
      if (selectedProduct.unit === 'm' && !length) {
        setError('Kérjük, add meg a hosszúságot.');
        return;
      }
      try {
        const calculated = calculateQuoteItem({
          product: selectedProduct,
          color: selectedColor,
          widthCm: width,
          heightCm: height,
          lengthM: length,
          quantity,
        });
        setQuoteItem(calculated);

        if (window && window.dataLayer) {
          window.dataLayer.push({
            event: 'public_calculator_price_calculated',
            category: selectedCategory,
            productName: selectedProduct.name,
          });
        }

        setActiveStep(1);
      } catch (calcError) {
        console.error('Public widget price error', calcError);
        setError(calcError.message || 'Hiba történt az irányár kalkulációja során.');
      }
    } else if (activeStep === 1) {
      if (window && window.dataLayer) {
        window.dataLayer.push({
          event: 'public_calculator_lead_form_open',
        });
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmitLead = async () => {
    setError('');
    setSuccess('');

    if (!leadName || !leadEmail || !gdprAccepted) {
      setError('Kérjük, add meg a neved, e-mail címed és fogadd el az adatkezelést.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/public-leads`, {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        message: leadMessage,
        quoteItem,
        priceRange: { min: minPrice, max: maxPrice },
        source: 'public-widget',
      });

      if (window && window.dataLayer) {
        window.dataLayer.push({
          event: 'public_calculator_lead_submitted',
        });
      }

      setSuccess('Köszönjük! Hamarosan felvesszük veled a kapcsolatot.');
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadMessage('');
      setGdprAccepted(false);
    } catch (e) {
      console.error('Lead submit error', e);
      setError('Nem sikerült elküldeni az ajánlatkérést. Kérjük, próbáld újra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={cardStyles}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 1, color: '#111', letterSpacing: 0.2 }}
            >
              Gyors árajánlat kalkulátor
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Pár kattintással irányárat kapsz, majd elküldheted az adataidat pontos ajánlathoz.
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {activeStep === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {projectTypeLabel}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Kategória</InputLabel>
                        <Select
                          value={selectedCategory}
                          label="Kategória"
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedProductId('');
                            setSelectedColor('');
                          }}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={!selectedCategory}>
                        <InputLabel>Termék</InputLabel>
                        <Select
                          value={selectedProductId}
                          label="Termék"
                          onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                          {products
                            .filter((p) => p.category === selectedCategory)
                            .map((p) => (
                              <MenuItem key={p._id} value={p._id}>
                                {p.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={!selectedProduct}>
                        <InputLabel>Szín</InputLabel>
                        <Select
                          value={selectedColor}
                          label="Szín"
                          onChange={(e) => setSelectedColor(e.target.value)}
                        >
                          {availableColors.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {selectedProduct && selectedProduct.unit === 'm2' && (
                      <>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Szélesség (cm)"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Magasság (cm)"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                          />
                        </Grid>
                      </>
                    )}

                    {selectedProduct && selectedProduct.unit === 'm' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Hossz (m)"
                          type="number"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mennyiség"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 1 && quoteItem && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Várható ár
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: primaryColor,
                    }}
                  >
                    {minPrice.toLocaleString('hu-HU')} – {maxPrice.toLocaleString('hu-HU')} Ft
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Ez nem végleges ajánlat, hanem egy becsült ár-tartomány a megadott adatok alapján.
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius,
                      background: 'rgba(0,0,0,0.02)',
                      textAlign: 'left',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Összefoglaló:
                    </Typography>
                    <Typography variant="body2">
                      {quoteItem.productName} – {quoteItem.color}
                    </Typography>
                    <Typography variant="body2">
                      {quoteItem.dimensions} • {quoteItem.quantity} db
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    Szeretnél pontos, személyre szabott ajánlatot kapni ezzel a konfigurációval?
                  </Typography>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Kérj pontos ajánlatot
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Név"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="E-mail cím"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Telefonszám (nem kötelező)"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Megjegyzés / igények (nem kötelező)"
                        value={leadMessage}
                        multiline
                        rows={3}
                        onChange={(e) => setLeadMessage(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={gdprAccepted}
                            onChange={(e) => setGdprAccepted(e.target.checked)}
                          />
                        }
                        label="Elfogadom, hogy az adataimat ajánlatküldés céljából kezeljék."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button disabled={activeStep === 0 || submitting} onClick={handleBack}>
                  Vissza
                </Button>

                {activeStep < 2 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={submitting}
                    sx={{
                      background: primaryColor,
                      '&:hover': {
                        background: accentColor,
                      },
                    }}
                  >
                    {activeStep === 1 ? 'Ajánlatkérés' : 'Irányár mutatása'}
                  </Button>
                )}

                {activeStep === 2 && (
                  <Button
                    variant="contained"
                    onClick={handleSubmitLead}
                    disabled={submitting}
                    sx={{
                      background: primaryColor,
                      '&:hover': {
                        background: accentColor,
                      },
                    }}
                  >
                    {submitting ? 'Küldés...' : 'Ajánlatkérés elküldése'}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default PublicCalculatorWidget;

