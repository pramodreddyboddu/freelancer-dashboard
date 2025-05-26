import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Dashboard: React.FC = () => (
  <Container>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to your FreelanceFlow dashboard.
      </Typography>
    </Box>
  </Container>
);

export default Dashboard;
