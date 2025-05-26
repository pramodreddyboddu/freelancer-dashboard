import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { fetchPitchesStart, fetchPitchesSuccess, fetchPitchesFailure } from '../store/slices/pitchSlice';
import { pitchAPI } from '../services/api';
import { Pitch } from '../store/slices/pitchSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pitches, loading, error } = useSelector((state: RootState) => state.pitch);
  const [stats, setStats] = useState({
    totalPitches: 0,
    approvedPitches: 0,
    scheduledPitches: 0
  });

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        dispatch(fetchPitchesStart());
        const response = await pitchAPI.getPitches();
        dispatch(fetchPitchesSuccess(response.data.pitches));
        
        // Calculate stats
        const total = response.data.pitches.length;
        const approved = response.data.pitches.filter((pitch: Pitch) => pitch.status === 'approved').length;
        const scheduled = response.data.pitches.filter((pitch: Pitch) => pitch.status === 'scheduled').length;
        
        setStats({
          totalPitches: total,
          approvedPitches: approved,
          scheduledPitches: scheduled
        });
      } catch (error: any) {
        dispatch(fetchPitchesFailure(error.message));
      }
    };

    fetchPitches();
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#ff9800';
      case 'approved':
        return '#4caf50';
      case 'scheduled':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/generate-pitch')}
        >
          Generate New Pitch
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Pitches
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'medium' }}>
              {stats.totalPitches}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Approved Pitches
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'medium', color: '#4caf50' }}>
              {stats.approvedPitches}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Scheduled Pitches
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'medium', color: '#2196f3' }}>
              {stats.scheduledPitches}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Pitches
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : pitches.length === 0 ? (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No pitches yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate your first pitch to get started
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/generate-pitch')}
            >
              Generate New Pitch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {pitches.slice(0, 6).map((pitch: Pitch) => (
            <Grid item xs={12} md={6} key={pitch.id}>
              <Card 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onClick={() => navigate(`/pitches/${pitch.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                      {pitch.gigDetails.projectType}
                    </Typography>
                    <Chip 
                      label={pitch.status.charAt(0).toUpperCase() + pitch.status.slice(1)} 
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(pitch.status),
                        color: 'white'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Budget: ${pitch.gigDetails.budget}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {pitch.skills.slice(0, 3).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                    {pitch.skills.length > 3 && (
                      <Chip label={`+${pitch.skills.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {formatDate(pitch.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {pitches.length > 6 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/pitches')}>
            View All Pitches
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
