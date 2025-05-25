import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Event as EventIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { RootState } from '../store';
import { 
  fetchPitchByIdStart, 
  fetchPitchByIdSuccess, 
  fetchPitchByIdFailure,
  updatePitchStart,
  updatePitchSuccess,
  updatePitchFailure,
  deletePitchStart,
  deletePitchSuccess,
  deletePitchFailure,
  schedulePitchStart,
  schedulePitchSuccess,
  schedulePitchFailure
} from '../store/slices/pitchSlice';
import { pitchAPI, calendarAPI } from '../services/api';

const PitchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPitch, loading, error } = useSelector((state: RootState) => state.pitch);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPitch, setEditedPitch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    duration: 30,
    title: '',
    description: ''
  });

  useEffect(() => {
    const fetchPitch = async () => {
      if (!id) return;
      
      try {
        dispatch(fetchPitchByIdStart());
        const response = await pitchAPI.getPitchById(id);
        dispatch(fetchPitchByIdSuccess(response.data));
        
        // Initialize edited pitch with the current pitch content
        if (response.data.editedPitch) {
          setEditedPitch(response.data.editedPitch);
        } else {
          setEditedPitch(response.data.generatedPitch);
        }
        
        // Initialize schedule data
        setScheduleData({
          scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
          duration: 30,
          title: `Pitch for ${response.data.gigDetails.projectType}`,
          description: response.data.editedPitch || response.data.generatedPitch
        });
      } catch (error: any) {
        dispatch(fetchPitchByIdFailure(error.message));
      }
    };

    fetchPitch();
  }, [dispatch, id]);

  const handleSaveEdit = async () => {
    if (!currentPitch || !id) return;
    
    try {
      dispatch(updatePitchStart());
      const response = await pitchAPI.updatePitch(id, {
        editedPitch: editedPitch,
        status: 'approved'
      });
      dispatch(updatePitchSuccess(response.data));
      setIsEditing(false);
    } catch (error: any) {
      dispatch(updatePitchFailure(error.message));
    }
  };

  const handleCancelEdit = () => {
    if (currentPitch) {
      setEditedPitch(currentPitch.editedPitch || currentPitch.generatedPitch);
    }
    setIsEditing(false);
  };

  const handleDeletePitch = async () => {
    if (!id) return;
    
    try {
      dispatch(deletePitchStart());
      await pitchAPI.deletePitch(id);
      dispatch(deletePitchSuccess(id));
      setDeleteDialogOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      dispatch(deletePitchFailure(error.message));
    }
  };

  const handleSchedulePitch = async () => {
    if (!id) return;
    
    try {
      dispatch(schedulePitchStart());
      const response = await pitchAPI.schedulePitch(id, scheduleData);
      dispatch(schedulePitchSuccess(response.data.pitch));
      setScheduleDialogOpen(false);
    } catch (error: any) {
      dispatch(schedulePitchFailure(error.message));
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

  if (loading && !currentPitch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!currentPitch) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Pitch not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pitch Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EventIcon />}
            onClick={() => setScheduleDialogOpen(true)}
            sx={{ mr: 1 }}
            disabled={currentPitch.status === 'scheduled'}
          >
            Schedule
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gig Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary">
                Project Type
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentPitch.gigDetails.projectType}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ${currentPitch.gigDetails.budget}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Timeline
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentPitch.gigDetails.timeline.replace(/_/g, ' ')}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Platform
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentPitch.gigDetails.platform.charAt(0).toUpperCase() + currentPitch.gigDetails.platform.slice(1)}
              </Typography>
              
              {currentPitch.gigDetails.additionalInfo && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Information
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {currentPitch.gigDetails.additionalInfo}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle2" color="text.secondary">
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {currentPitch.skills.map((skill, index) => (
                  <Chip key={index} label={skill} size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pitch Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={currentPitch.status.charAt(0).toUpperCase() + currentPitch.status.slice(1)} 
                color={
                  currentPitch.status === 'approved' 
                    ? 'success' 
                    : currentPitch.status === 'scheduled' 
                      ? 'primary' 
                      : 'default'
                }
                sx={{ my: 1 }}
              />
              
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(currentPitch.createdAt)}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(currentPitch.updatedAt)}
              </Typography>
              
              {currentPitch.calendarEventId && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary"
                    size="small"
                    startIcon={<EventIcon />}
                  >
                    View in Calendar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {isEditing ? 'Edit Pitch' : 'Pitch Content'}
              </Typography>
              {!isEditing ? (
                <IconButton color="primary" onClick={() => setIsEditing(true)}>
                  <EditIcon />
                </IconButton>
              ) : (
                <Box>
                  <IconButton color="error" onClick={handleCancelEdit} sx={{ mr: 1 }}>
                    <CloseIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={handleSaveEdit}>
                    <SaveIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                value={editedPitch}
                onChange={(e) => setEditedPitch(e.target.value)}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography variant="body1">
                  {currentPitch.editedPitch || currentPitch.generatedPitch}
                </Typography>
              </Paper>
            )}
          </Paper>
          
          {currentPitch.status === 'scheduled' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              This pitch has been scheduled. You can view it in your calendar.
            </Alert>
          )}
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Pitch</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this pitch? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePitch} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Pitch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Schedule this pitch as a task in your calendar to remind you when to send it.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={scheduleData.title}
                onChange={(e) => setScheduleData({...scheduleData, title: e.target.value})}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date & Time"
                type="datetime-local"
                fullWidth
                value={scheduleData.scheduledDate}
                onChange={(e) => setScheduleData({...scheduleData, scheduledDate: e.target.value})}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={scheduleData.duration}
                onChange={(e) => setScheduleData({...scheduleData, duration: parseInt(e.target.value)})}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={scheduleData.description}
                onChange={(e) => setScheduleData({...scheduleData, description: e.target.value})}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchedulePitch} color="primary" variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PitchDetails;
