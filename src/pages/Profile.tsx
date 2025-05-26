import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Profile: React.FC = () => (
  <Container>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1">
        Manage your freelancer profile here.
      </Typography>
    </Box>
  </Container>
);

export default Profile;
