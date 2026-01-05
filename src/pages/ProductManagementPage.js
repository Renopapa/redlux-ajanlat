import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Termékek kezelése</Typography>
      
      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Új termék hozzáadása
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Név</TableCell>
              <TableCell>Kategória</TableCell>
              <TableCell>Alapár</TableCell>
              <TableCell>Kedvezmény (%)</TableCell>
              <TableCell>Mértékegység</TableCell>
              <TableCell>Munkadíj</TableCell>
              <TableCell>Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
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