import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Grid, Container } from '@mui/material';

function HomePage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Árajánlat Készítő
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Készítsen gyorsan és egyszerűen professzionális árajánlatokat
      </Typography>
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/create-quote"
            size="large"
          >
            Új árajánlat készítése
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/quotes"
            size="large"
          >
            Árajánlatok keresése
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;