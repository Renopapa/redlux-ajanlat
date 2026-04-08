import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CreateQuotePage from './pages/CreateQuotePage';
import QuoteSearchPage from './pages/QuoteSearchPage';
import ProductManagementPage from './pages/ProductManagementPage';
import StatisticsPage from './pages/StatisticsPage';
import RevenueTracker from './pages/RevenueTracker';

// Új komponens a navigációs linkek kezelésére
function NavLink({ to, children }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (window.location.pathname === to) {
      // Ha ugyanazon az útvonalon vagyunk, frissítsük az oldalt
      window.location.reload();
    } else {
      // Egyébként navigáljunk az új útvonalra
      navigate(to);
    }
  };

  return (
    <Button color="inherit" onClick={handleClick}>
      {children}
    </Button>
  );
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Új árajánlat', path: '/new-quote' },
    { text: 'Árajánlatok keresése', path: '/search' },
    { text: 'Termékek kezelése', path: '/products' },
    { text: 'Statisztikák', path: '/statistics' },
    { text: 'Bevétel-Kiadás', path: '/revenue-tracker' },
  ];

  const drawerContent = (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={NavLink} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Árajánlat Készítő
          </Typography>
          {!isMobile && menuItems.map((item) => (
            <NavLink key={item.text} to={item.path}>
              {item.text}
            </NavLink>
          ))}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={isMobile && drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
      <Routes>
        <Route path="/new-quote" element={<CreateQuotePage />} />
        <Route path="/quote/:id" element={<CreateQuotePage />} />
        <Route path="/search" element={<QuoteSearchPage />} />
        <Route path="/products" element={<ProductManagementPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/revenue-tracker" element={<RevenueTracker />} />
      </Routes>
    </Router>
  );
}

export default App;