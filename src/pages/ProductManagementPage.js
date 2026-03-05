import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import API_URL from '../config/api';

const defaultColors = [
  { name: "Fehér", surcharge: 0 },
  { name: "Barna", surcharge: 0 },
  { name: "Antracit", surcharge: 0 },
  { name: "Szürke", surcharge: 40 },
  { name: "Dió", surcharge: 60 },
  { name: "Aranytölgy", surcharge: 60 },
  { name: "Mahagóni", surcharge: 60 },
  { name: "RAL szín", surcharge: 40 }
];

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: '', 
    basePrice: '', 
    discount: '', 
    unit: '', 
    laborCost: '',
  
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [orderDirection, setOrderDirection] = useState('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Hiba történt a termékek betöltése során: ' + error.message, severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleColorChange = (event) => {
    const selectedColors = event.target.value;
    const productColors = selectedColors.map(colorName => {
      const defaultColor = defaultColors.find(c => c.name === colorName);
      return { name: colorName, surcharge: defaultColor ? defaultColor.surcharge : 0 };
    });

    if (editingProduct) {
      setEditingProduct({ ...editingProduct,  });
    } else {
      setNewProduct({ ...newProduct, });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id}`, editingProduct);
        setSnackbar({ open: true, message: 'Termék sikeresen frissítve!', severity: 'success' });
      } else {
        await axios.post(`${API_URL}/products`, newProduct);
        setSnackbar({ open: true, message: 'Új termék sikeresen hozzáadva!', severity: 'success' });
      }
      fetchProducts();
      setNewProduct({ name: '', category: '', basePrice: '', discount: '', unit: '', laborCost: '',  });
      setEditingProduct(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({ open: true, message: 'Hiba történt a termék mentése során: ' + error.message, severity: 'error' });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({...product, });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setSnackbar({ open: true, message: 'Termék sikeresen törölve!', severity: 'success' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ open: true, message: 'Hiba történt a termék törlése során: ' + error.message, severity: 'error' });
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(
      (products || [])
        .map((p) => (p?.category ?? '').toString().trim())
        .filter(Boolean)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'hu'));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = (products || []).filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!q) return true;

      const haystack = [
        p.name,
        p.category,
        p.unit,
        p.basePrice,
        p.discount,
        p.laborCost
      ]
        .filter((v) => v !== undefined && v !== null)
        .map((v) => v.toString().toLowerCase())
        .join(' ');

      return haystack.includes(q);
    });

    const getSortable = (p, key) => {
      const value = p?.[key];
      if (key === 'basePrice' || key === 'discount' || key === 'laborCost') {
        const num = typeof value === 'number' ? value : parseFloat(value);
        return Number.isFinite(num) ? num : 0;
      }
      return (value ?? '').toString();
    };

    const sorted = [...filtered].sort((a, b) => {
      const av = getSortable(a, orderBy);
      const bv = getSortable(b, orderBy);

      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = av.toString().localeCompare(bv.toString(), 'hu', { numeric: true, sensitivity: 'base' });
      }
      return orderDirection === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [products, searchQuery, categoryFilter, orderBy, orderDirection]);

  const groupedVisibleProducts = useMemo(() => {
    const map = new Map();
    for (const p of visibleProducts) {
      const key = (p?.category ?? '').toString().trim() || 'Egyéb';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'hu'));
  }, [visibleProducts]);

  const handleRequestSort = (property) => {
    if (orderBy === property) {
      setOrderDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setOrderBy(property);
    setOrderDirection('asc');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Termékek kezelése</Typography>
      
      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Új termék hozzáadása
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Keresés"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Kategória</InputLabel>
          <Select
            value={categoryFilter}
            label="Kategória"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">Összes</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          {visibleProducts.length} / {products.length} termék
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {groupedVisibleProducts.map(([category, items]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography sx={{ fontWeight: 700 }}>{category}</Typography>
                <Chip size="small" label={`${items.length} db`} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sortDirection={orderBy === 'name' ? orderDirection : false}>
                        <TableSortLabel
                          active={orderBy === 'name'}
                          direction={orderBy === 'name' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('name')}
                        >
                          Név
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'basePrice' ? orderDirection : false}>
                        <TableSortLabel
                          active={orderBy === 'basePrice'}
                          direction={orderBy === 'basePrice' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('basePrice')}
                        >
                          Alapár
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'discount' ? orderDirection : false}>
                        <TableSortLabel
                          active={orderBy === 'discount'}
                          direction={orderBy === 'discount' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('discount')}
                        >
                          Kedvezmény (%)
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'unit' ? orderDirection : false}>
                        <TableSortLabel
                          active={orderBy === 'unit'}
                          direction={orderBy === 'unit' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('unit')}
                        >
                          Mértékegység
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'laborCost' ? orderDirection : false}>
                        <TableSortLabel
                          active={orderBy === 'laborCost'}
                          direction={orderBy === 'laborCost' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('laborCost')}
                        >
                          Munkadíj
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Műveletek</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.basePrice}</TableCell>
                        <TableCell>{product.discount}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{product.laborCost}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(product._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingProduct ? 'Termék szerkesztése' : 'Új termék hozzáadása'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Név"
              name="name"
              value={editingProduct ? editingProduct.name : newProduct.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Kategória"
              name="category"
              value={editingProduct ? editingProduct.category : newProduct.category}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Alapár"
              name="basePrice"
              type="number"
              value={editingProduct ? editingProduct.basePrice : newProduct.basePrice}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Kedvezmény (%)"
              name="discount"
              type="number"
              value={editingProduct ? editingProduct.discount : newProduct.discount}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mértékegység"
              name="unit"
              value={editingProduct ? editingProduct.unit : newProduct.unit}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Munkadíj"
              name="laborCost"
              type="number"
              value={editingProduct ? editingProduct.laborCost : newProduct.laborCost}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Mégse</Button>
          <Button onClick={handleSubmit} color="primary">
            {editingProduct ? 'Mentés' : 'Hozzáadás'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProductManagementPage;