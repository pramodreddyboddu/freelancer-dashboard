import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const PitchDetails: React.FC = () => (
  <Container>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pitch Details
      </Typography>
      <Typography variant="body1">
        View and manage your pitch details here.
      </Typography>
    </Box>
  </Container>
);

export default PitchDetails;
