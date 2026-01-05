import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import QuotePDF from '../components/QuotePDF';
import { getColorSurcharge, availableColors } from '../data/productData';
import { FormControlLabel, Checkbox } from '@mui/material';

import API_URL from '../config/api';

function CreateQuotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [surveyor, setSurveyor] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [length, setLength] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [currentUnit, setCurrentUnit] = useState('');
  const [openPreview, setOpenPreview] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [clientQuotes, setClientQuotes] = useState([]);
  const [quoteStatus, setQuoteStatus] = useState('Piszkozat');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [quoteVersions, setQuoteVersions] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  //const [availableColors, setAvailableColors] = useState([]);
  const [personalSurvey, setPersonalSurvey] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clientNeeds, setClientNeeds] = useState('');

  useEffect(() => {
    console.log('Imported availableColors:', availableColors);
  }, []);

  useEffect(() => {
    fetchQuotes();
    if (id) {
      console.log("Fetching quote with ID:", id);
      fetchQuote(id);
    } else {
      resetForm();
    }
  }, [id]);

  useEffect(() => {
    console.log('Selected product:', selectedProduct);
    console.log('Available colors:', availableColors);
  }, [selectedProduct, availableColors]);

  useEffect(() => {
    if (location.pathname === '/') {
      resetForm();
    }
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    setCategories(uniqueCategories);
  }, [products]);

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    if (Array.isArray(response.data)) {
      setProducts(response.data);
    } else {
      console.error('Invalid product data format:', response.data);
      setError('A termékek betöltése sikertelen. Érvénytelen adatformátum.');
      setProducts([]);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    setError('Hiba történt a termékek betöltése során.');
    setProducts([]);
  }
};
  const generateClientId = async () => {
    try {
      const response = await axios.get(`${API_URL}/generate-client-id`);
      setClientId(response.data.clientId);
    } catch (error) {
      console.error('Error generating client ID:', error);
      setError('Hiba történt az ügyfél azonosító generálása során.');
    }
  };

  const fetchQuote = async (quoteId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quotes/${quoteId}`);
      const { quote, versions } = response.data;
      console.log("Fetched quote:", quote);
      if (quote) {
        setQuoteData(quote);
        setEditingQuoteId(quoteId);
        setQuoteVersions(versions);
      } else {
        console.error("Received empty quote data");
        setError('Nem sikerült betölteni az árajánlat adatait.');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Hiba történt az árajánlat betöltése során: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setQuoteData = (quoteData) => {
    if (quoteData && quoteData._id) {
      console.log("Setting quote data:", quoteData);
      setEditingQuoteId(quoteData._id);
      setClientName(quoteData.clientName || '');
      setClientId(quoteData.clientId || '');
      setClientAddress(quoteData.clientAddress || '');
      setClientPhone(quoteData.clientPhone || '');
      setClientEmail(quoteData.clientEmail || '');
      setClientNeeds(quoteData.clientNeeds || '');
      setQuoteItems(quoteData.quoteItems || []);
      setQuoteStatus(quoteData.status || 'Piszkozat');
      setDiscount(quoteData.discount || 0);
      setNotes(quoteData.notes || '');
      setSurveyor(quoteData.surveyor || '');
      setPersonalSurvey(quoteData.personalSurvey || false);  // Hozzáadva
    } else {
      console.error('Invalid quote data:', quoteData);
      setError('Érvénytelen árajánlat adat');
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotes`);
      setSavedQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Hiba történt az árajánlatok betöltése során.');
    }
  };

  const handleProductChange = (e) => {
    const productName = e.target.value;
    setSelectedProduct(productName);
    const product = products.find(p => p.name === productName);
    
    if (product) {
      setCurrentUnit(product.unit);
      setSelectedColor('');
    } else {
      setCurrentUnit('');
      setSelectedColor('');
    }
  
    console.log('Selected product:', productName);
    console.log('Available colors:', availableColors);
  };

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find(p => p.name === selectedProduct);
      if (!product) {
        setError('A kiválasztott termék nem található.');
        return;
      }
        
      let dimensions = '';
      let area = 0;
  
      const roundUpToFirstDecimal = (num) => Math.ceil(num * 10) / 10;
  
      switch (product.unit) {
        case 'm2':
          if (!width || !height) {
            setError('Kérjük, adja meg a szélességet és magasságot.');
            return;
          }
          const widthInMeters = roundUpToFirstDecimal(parseFloat(width) / 100);
          const heightInMeters = roundUpToFirstDecimal(parseFloat(height) / 100);
          area = widthInMeters * heightInMeters;
          area = Math.max(area, 1.3);
          dimensions = `${widthInMeters.toFixed(1)}x${heightInMeters.toFixed(1)} m`;
          break;
        case 'm':
          if (!length) {
            setError('Kérjük, adja meg a hosszúságot.');
            return;
          }
          const roundedLength = roundUpToFirstDecimal(parseFloat(length));
          area = roundedLength;
          dimensions = `${roundedLength.toFixed(1)} m`;
          break;
        case 'db':
          dimensions = `${quantity} db`;
          area = 1; // Itt a változtatás: az area 1 lesz, nem pedig a mennyiség
          break;
        default:
          dimensions = `${quantity} ${product.unit}`;
          area = 1; // Itt is 1-et használunk alapértelmezettként
      }
  
      const colorSurcharge = getColorSurcharge(product.category, selectedColor);
      const basePrice = product.basePrice * area;
      const priceWithSurcharge = basePrice * (1 + colorSurcharge / 100);
      const materialPrice = priceWithSurcharge * quantity; // Itt már figyelembe vesszük a mennyiséget
      const laborCost = (product.laborCost || 0) * quantity;
      const totalPriceBeforeDiscount = materialPrice + laborCost;
      const discount = product.discount || 0;
      const totalPrice = totalPriceBeforeDiscount * (1 - discount / 100);
  
      const newItem = {
        product: selectedProduct,
        dimensions: dimensions,
        quantity,
        color: selectedColor,
        materialPrice: materialPrice,
        laborCost: laborCost,
        discount: discount,
        totalPrice: totalPrice,
        area: area > 0 ? area.toFixed(2) : null,
      };
  
      if (editingItemIndex !== null) {
        const newQuoteItems = [...quoteItems];
        newQuoteItems[editingItemIndex] = newItem;
        setQuoteItems(newQuoteItems);
        setEditingItemIndex(null);
      } else {
        setQuoteItems([...quoteItems, newItem]);
      }
  
      resetProductForm();
      setSuccessMessage('Termék sikeresen hozzáadva az árajánlathoz.');
    } else {
      setError('Kérjük, válasszon terméket és adjon meg érvényes mennyiséget.');
    }
  };

  const resetProductForm = () => {
    setSelectedProduct('');
    setSelectedColor('');
    setWidth('');
    setHeight('');
    setLength('');
    setQuantity(1);
    setSelectedCategory('');
    setCurrentUnit('');
  };

  const handleRemoveProduct = (index) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
    setSuccessMessage('Termék sikeresen eltávolítva az árajánlatból.');
  };

  const handleEditProduct = (index) => {
    const itemToEdit = quoteItems[index];
    setSelectedProduct(itemToEdit.product);
    setSelectedColor(itemToEdit.color);
    setQuantity(itemToEdit.quantity);
    
    const product = products.find(p => p.name === itemToEdit.product);
    if (product) {
      setSelectedCategory(product.category);
      setCurrentUnit(product.unit);
      
      if (product.unit === 'm2') {
        const [width, height] = itemToEdit.dimensions.split('x');
        setWidth((parseFloat(width) * 100).toString());
        setHeight((parseFloat(height) * 100).toString());
      } else if (product.unit === 'm') {
        setLength(itemToEdit.dimensions.split(' ')[0]);
      }
    }
    
    setEditingItemIndex(index);
  };

  const calculateTotal = () => {
    const originalTotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalDiscount = discount || 0;
    return originalTotal * (1 - finalDiscount / 100);
  };

  const handleOpenPreview = () => {
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleSaveQuote = async () => {
    if (!clientName || quoteItems.length === 0) {
      setError('Kérjük, adja meg az ügyfél nevét és legalább egy terméket az árajánlathoz.');
      return;
    }
  
    try {
      const quoteData = {
        clientName,
        clientId,
        clientAddress,
        clientPhone,
        clientEmail,
        clientNeeds,
        quoteItems,
        total: calculateTotal(),
        discount,
        status: quoteStatus,
        notes,
        surveyor,
        personalSurvey // Új mező hozzáadva
      };
      
      let response;
      if (editingQuoteId) {
        const existingQuote = await axios.get(`${API_URL}/quotes/${editingQuoteId}`);
        const hasSignificantChanges = JSON.stringify({...existingQuote.data, status: quoteStatus}) !== JSON.stringify(quoteData);
        
        if (hasSignificantChanges) {
          response = await axios.put(`${API_URL}/quotes/${editingQuoteId}`, quoteData);
        } else {
          response = await axios.patch(`${API_URL}/quotes/${editingQuoteId}/status`, { status: quoteStatus });
        }
      } else {
        response = await axios.post(`${API_URL}/quotes`, quoteData);
      }
      
      const { quote, versions } = response.data;
      setQuoteData(quote);
      setEditingQuoteId(quote._id);
      setQuoteVersions(versions);
      setSuccessMessage(editingQuoteId ? 'Árajánlat sikeresen frissítve!' : 'Új árajánlat sikeresen mentve!');
    } catch (error) {
      console.error('Error saving/updating quote:', error);
      setError('Hiba történt az árajánlat mentése/frissítése során: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = useCallback(() => {
    setClientName('');
    setClientAddress('');
    setClientPhone('');
    setClientEmail('');
    setClientNeeds('');
    setQuoteItems([]);
    setEditingQuoteId(null);
    resetProductForm();
    setQuoteStatus('Piszkozat');
    setDiscount(0);
    setNotes('');
    generateClientId();
  }, []);

  const fetchClientQuotes = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/quotes/client/${id}`);
      setClientQuotes(response.data);
    } catch (error) {
      console.error('Error fetching client quotes:', error);
      setError('Hiba történt az ügyfél árajánlatainak betöltése során.');
    }
  };

  const handleClientChange = (event) => {
    const selectedClientId = event.target.value;
    setClientId(selectedClientId);
    fetchClientQuotes(selectedClientId);
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const cleanedPhone = phone.replace(/\s/g, '');
    const re = /^(\+?36|06)(20|30|70|50|1|31)\d{7}$/;
    return re.test(cleanedPhone);
  };

const handleDownloadPDF = async () => {
  setLoading(true);
  try {
    const payload = {
      clientName, clientId, clientAddress, clientPhone, clientEmail,clientNeeds,
      quoteItems, total: calculateTotal(), discount, notes
    };

    const response = await axios.post(`${API_URL}/generate-pdf`, payload, {
      responseType: 'arraybuffer', // <-- így biztosan a nyers PDF bájtokat kapjuk
      validateStatus: (s) => s < 500 // 4xx-et se dobja el, hogy tudjunk értelmes hibát jelezni
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('application/pdf')) {
      // Valószínűleg hiba JSON jött – írjuk ki
      const text = new TextDecoder().decode(response.data);
      throw new Error(`Szerver hiba: ${text}`);
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `arajanlat_${clientId || 'dokumentum'}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setSuccessMessage('PDF letöltve!');
  } catch (error) {
    console.error(error);
    setError('PDF hiba: ' + (error?.message || 'ismeretlen hiba'));
  } finally {
    setLoading(false);
  }
};


  const loadQuoteVersion = async (versionId) => {
    try {
      const response = await axios.get(`${API_URL}/quotes/${versionId}`);
      const { quote, versions } = response.data;
      setQuoteData(quote);
      setEditingQuoteId(versionId);
      setQuoteVersions(versions);
      setHistoryDialogOpen(false);
      setSuccessMessage('Árajánlat verzió sikeresen betöltve.');
    } catch (error) {
      console.error('Error loading quote version:', error);
      setError('Hiba történt a verzió betöltése során.');
    }
  };

  const QuoteHistoryDialog = ({ open, onClose, versions, onLoadVersion }) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Árajánlat verziótörténet</DialogTitle>
        <DialogContent>
          <List>
            {versions && versions.length > 0 ? (
              versions.map((version) => (
                <ListItem key={version._id}>
                  <ListItemText
                    primary={`Verzió ${version.version}`}
                    secondary={`Létrehozva: ${new Date(version.createdAt).toLocaleString()}`}
                  />
                  <Button onClick={() => onLoadVersion(version._id)}>
                    Betöltés
                  </Button>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Nincsenek elérhető verziók" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Bezárás</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
            {editingQuoteId ? 'Árajánlat szerkesztése' : 'Új árajánlat készítése'}
          </Typography>
          
          {/* Ügyfél adatai szekció */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#555' }}>
              Ügyfél adatai
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Ügyfél neve" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  variant="outlined"
                  required
                  error={!clientName}
                  helperText={!clientName ? "Az ügyfél neve kötelező" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Ügyfél azonosító" 
                  value={clientId} 
                  disabled
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Cím" 
                  value={clientAddress} 
                  onChange={(e) => setClientAddress(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Telefonszám" 
                  value={clientPhone} 
                  onChange={(e) => setClientPhone(e.target.value)}
                  variant="outlined"
                  error={clientPhone && !validatePhone(clientPhone)}
                  helperText={clientPhone && !validatePhone(clientPhone) ? "Érvénytelen telefonszám" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="E-mail cím" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)}
                  variant="outlined"
                  error={clientEmail && !validateEmail(clientEmail)}
                  helperText={clientEmail && !validateEmail(clientEmail) ? "Érvénytelen e-mail cím" : ""}
                />
              </Grid>

              <Grid item xs={12}>
  <TextField 
    fullWidth 
    label="Ügyfél igényei / Mit beszéltünk meg" 
    value={clientNeeds}
    onChange={(e) => setClientNeeds(e.target.value)}
    variant="outlined"
    multiline
    rows={4}
    placeholder="Pl.: Az ügyfél nagyméretű ablakaira motorral ellátott redőnyöket és szúnyoghálókat keres."
  />
</Grid>
            </Grid>
          </Paper>

          {/* Árajánlat adatai szekció */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#555' }}>
              Árajánlat adatai
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Árajánlat státusza</InputLabel>
                  <Select
                    value={quoteStatus}
                    onChange={(e) => setQuoteStatus(e.target.value)}
                    label="Árajánlat státusza"
                  >
                    <MenuItem value="Piszkozat">Piszkozat</MenuItem>
                    <MenuItem value="Elküldve">Elküldve</MenuItem>
                    <MenuItem value="Elfogadva">Elfogadva</MenuItem>
                    <MenuItem value="Elutasítva">Elutasítva</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Felmérő</InputLabel>
                  <Select
                    value={surveyor}
                    onChange={(e) => setSurveyor(e.target.value)}
                    label="Felmérő"
                  >
                    <MenuItem value="Rénó">Rénó</MenuItem>
                    <MenuItem value="Ferenc">Ferenc</MenuItem>
                    <MenuItem value="Béla">Béla</MenuItem>
                    <MenuItem value="Norbi">Norbi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={personalSurvey}
                  onChange={(e) => setPersonalSurvey(e.target.checked)}
                  name="personalSurvey"
                />
              }
              label="Személyes felmérés"
            />
          </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Kedvezmény (%)" 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value))))}
                  variant="outlined"
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      max: 100 
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Megjegyzések" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Termék hozzáadása szekció */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#555' }}>
              {editingItemIndex !== null ? 'Termék szerkesztése' : 'Termék hozzáadása'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
  <InputLabel>Kategória</InputLabel>
  <Select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setSelectedProduct('');
    }}
    label="Kategória"
  >
    {categories.map((category) => (
      <MenuItem key={category} value={category}>{category}</MenuItem>
    ))}
  </Select>
</FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Termék</InputLabel>
                  <Select
  value={selectedProduct}
  onChange={handleProductChange}
  label="Termék"
  disabled={!selectedCategory}
>
  {products
    .filter(product => product.category === selectedCategory)
    .map((product) => (
      <MenuItem key={product.name} value={product.name}>{product.name}</MenuItem>
    ))}
</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
  <InputLabel>Szín</InputLabel>
  <Select
    value={selectedColor}
    onChange={(e) => setSelectedColor(e.target.value)}
    label="Szín"
    disabled={!selectedProduct}
  >
    {availableColors.map((color) => (
      <MenuItem key={color} value={color}>{color}</MenuItem>
    ))}
  </Select>
</FormControl>
    </Grid>
              {currentUnit === 'm2' && (
                <>
                  <Grid item xs={12} sm={2}>
                    <TextField 
                      fullWidth 
                      label="Szélesség (cm)" 
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField 
                      fullWidth 
                      label="Magasság (cm)" 
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
              {currentUnit === 'm' && (
                <Grid item xs={12} sm={2}>
                  <TextField 
                    fullWidth 
                    label="Hossz (m)" 
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={2}>
                <TextField 
                  fullWidth 
                  label="Mennyiség" 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  variant="outlined"
                  InputProps={{
                    inputProps: { 
                      min: 1
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleAddProduct} 
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  {editingItemIndex !== null ? 'Módosítás' : 'Hozzáadás'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Árajánlat tételei szekció */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#555' }}>
              Árajánlat tételei
            </Typography>
            <List>
              {quoteItems.map((item, index) => {
                const originalPrice = item.totalPrice / (1 - item.discount / 100);
                return (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.product} - ${item.color}`}
                      secondary={
                        <>
                          <Typography variant="body2">{`${item.dimensions} - ${item.quantity} db`}</Typography>
                          {item.area && <Typography variant="body2">{`Terület: ${item.area} m²`}</Typography>}
                          <Typography variant="body2">
                            {item.discount > 0 ? (
                              <>
                                <span style={{ textDecoration: 'line-through', marginRight: 5 }}>
                                  {originalPrice.toFixed(0)} Ft
                                </span>
                                <span style={{ color: 'red' }}>
                                  {item.totalPrice.toFixed(0)} Ft
                                </span>
                              </>
                            ) : (
                              `${item.totalPrice.toFixed(0)} Ft`
                            )}
                          </Typography>
                          {item.discount > 0 && (
                            <Typography variant="body2" color="error">{`Kedvezmény: ${item.discount}%`}</Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditProduct(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveProduct(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" align="right">
              Végösszeg: {calculateTotal().toFixed(0)} Ft
            </Typography>
          </Paper>

          {/* Gombok és PDF generálás */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {quoteItems.length > 0 && (
              <>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleOpenPreview}
                >
                  PDF előnézet
                </Button>
                <Button 
  variant="contained" 
  color="primary" 
  onClick={handleDownloadPDF}
  disabled={loading || quoteItems.length === 0}
>
  {loading ? 'PDF generálása...' : 'PDF letöltése'}
</Button>
              </>
            )}
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveQuote} 
            sx={{ mt: 2, mr: 2 }}
          >
            {editingQuoteId ? 'Árajánlat frissítése' : 'Árajánlat mentése'}
          </Button>

          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={resetForm} 
            sx={{ mt: 2, mr: 2 }}
          >
            Űrlap törlése
          </Button>

          {editingQuoteId && (
            <Button 
              variant="outlined" 
              onClick={() => setHistoryDialogOpen(true)} 
              disabled={!quoteVersions || quoteVersions.length === 0}
              sx={{ mt: 2, mr: 2 }}
            >
              Verziótörténet
            </Button>
          )}

          <QuoteHistoryDialog
            open={historyDialogOpen}
            onClose={() => setHistoryDialogOpen(false)}
            versions={quoteVersions || []}
            onLoadVersion={loadQuoteVersion}
          />

          {/* PDF előnézet dialog */}
<Dialog
  open={openPreview}
  onClose={handleClosePreview}
  fullWidth
  maxWidth="lg"
>
  <DialogContent>
    <PDFViewer width="100%" height="600px">
      <QuotePDF 
        clientName={clientName}
        clientId={clientId}
        clientAddress={clientAddress}
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        quoteItems={quoteItems} 
        total={calculateTotal()}
        discount={discount}
        notes={notes}
        // Új paraméterek
        clientNeeds={clientNeeds} 
        bonusOffer="1 héten belüli megrendelés esetén 5% extra kedvezményt biztosítunk!"
        managerName="Kovács István"
        managerPosition="Ügyvezető igazgató"
      />
    </PDFViewer>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClosePreview} color="primary">
      Bezárás
    </Button>
  </DialogActions>
</Dialog>

          {/* Hibaüzenet és sikeres művelet visszajelzése */}
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
            <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
            <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}

export default CreateQuotePage;