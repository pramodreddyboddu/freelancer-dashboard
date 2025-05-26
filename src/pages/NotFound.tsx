import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const NotFound: React.FC = () => (
  <Container>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1">
        Sorry, the page you are looking for does not exist.
      </Typography>
    </Box>
  </Container>
);

export default NotFound;
