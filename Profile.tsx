import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../store';
import { updateProfileStart, updateProfileSuccess, updateProfileFailure } from '../store/slices/authSlice';
import { userAPI } from '../services/api';

interface ProfileFormValues {
  displayName: string;
  skills: string[];
  preferences: {
    emailNotifications: boolean;
  };
}

const validationSchema = Yup.object({
  displayName: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  skills: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one skill is required'),
});

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues: ProfileFormValues = {
    displayName: user?.displayName || '',
    skills: user?.skills || [''],
    preferences: {
      emailNotifications: true,
    },
  };

  const handleSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: FormikHelpers<ProfileFormValues>
  ) => {
    try {
      dispatch(updateProfileStart());
      const response = await userAPI.updateProfile(values);
      
      if (response.data.success) {
        dispatch(updateProfileSuccess(response.data.user));
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        dispatch(updateProfileFailure('Failed to update profile'));
        setGeneralError('Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update profile. Please try again.';
      dispatch(updateProfileFailure(errorMessage));
      setGeneralError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getSubscriptionDetails = () => {
    if (!user?.subscription) return null;
    
    const tierInfo = {
      free: {
        name: 'Free Tier',
        features: ['5 pitches/month', 'Basic features'],
        color: '#757575',
      },
      pro: {
        name: 'Pro Tier',
        features: ['Unlimited pitches', 'Basic analytics'],
        color: '#1976d2',
      },
      premium: {
        name: 'Premium Tier',
        features: ['Multi-platform integrations', 'Advanced analytics'],
        color: '#f50057',
      },
    };
    
    const tier = user.subscription.tier as keyof typeof tierInfo;
    return tierInfo[tier];
  };

  const subscriptionDetails = getSubscriptionDetails();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      {(error || generalError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || generalError}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#1976d2',
                  fontSize: '2.5rem',
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.displayName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              
              {subscriptionDetails && (
                <Chip
                  label={subscriptionDetails.name}
                  sx={{
                    bgcolor: subscriptionDetails.color,
                    color: 'white',
                    mt: 1,
                  }}
                />
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {subscriptionDetails ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Plan
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                    {subscriptionDetails.name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Features
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {subscriptionDetails.features.map((feature, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {feature}
                      </Typography>
                    ))}
                  </Box>
                  
                  {user?.subscription?.startDate && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {new Date(user.subscription.startDate).toLocaleDateString()}
                      </Typography>
                    </>
                  )}
                  
                  {user?.subscription?.endDate && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Renewal Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {new Date(user.subscription.endDate).toLocaleDateString()}
                      </Typography>
                    </>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Upgrade Plan
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No subscription information available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Edit Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, errors, touched, isSubmitting, handleChange }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        id="displayName"
                        name="displayName"
                        label="Full Name"
                        variant="outlined"
                        error={touched.displayName && Boolean(errors.displayName)}
                        helperText={touched.displayName && errors.displayName}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Skills
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add skills that describe your expertise
                      </Typography>
                      
                      {values.skills.map((skill, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                          <TextField
                            fullWidth
                            label={`Skill ${index + 1}`}
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...values.skills];
                              newSkills[index] = e.target.value;
                              handleChange({
                                target: {
                                  name: 'skills',
                                  value: newSkills,
                                },
                              });
                            }}
                            variant="outlined"
                            error={
                              touched.skills && 
                              Array.isArray(errors.skills) && 
                              Boolean(errors.skills[index])
                            }
                            helperText={
                              touched.skills && 
                              Array.isArray(errors.skills) && 
                              errors.skills[index]
                            }
                          />
                          
                          {index > 0 && (
                            <Button
                              color="error"
                              sx={{ ml: 1 }}
                              onClick={() => {
                                const newSkills = values.skills.filter((_, i) => i !== index);
                                handleChange({
                                  target: {
                                    name: 'skills',
                                    value: newSkills,
                                  },
                                });
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => {
                          handleChange({
                            target: {
                              name: 'skills',
                              value: [...values.skills, ''],
                            },
                          });
                        }}
                        sx={{ mb: 3 }}
                      >
                        Add Skill
                      </Button>
                      
                      {typeof errors.skills === 'string' && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          {errors.skills}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ mb: 2 }} />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || loading}
                        sx={{ py: 1.5, px: 4 }}
                      >
                        {(isSubmitting || loading) ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
