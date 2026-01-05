import React from 'react';
import { Typography, Box } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 2 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        © 2023 Árajánlat Készítő
      </Typography>
    </Box>
  );
}

export default Footer;