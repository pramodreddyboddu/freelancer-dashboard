import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Formik, Form, Field, FieldArray, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { generatePitchStart, generatePitchSuccess, generatePitchFailure } from '../store/slices/pitchSlice';
import { pitchAPI } from '../services/api';

interface PitchFormValues {
  skills: string[];
  gigDetails: {
    projectType: string;
    budget: number;
    timeline: string;
    platform: string;
    additionalInfo: string;
  };
}

const validationSchema = Yup.object({
  skills: Yup.array()
    .of(Yup.string().required('Skill cannot be empty'))
    .min(1, 'At least one skill is required'),
  gigDetails: Yup.object({
    projectType: Yup.string().required('Project type is required'),
    budget: Yup.number()
      .required('Budget is required')
      .positive('Budget must be positive'),
    timeline: Yup.string().required('Timeline is required'),
    platform: Yup.string().required('Platform is required'),
    additionalInfo: Yup.string(),
  }),
});

const PitchGenerator: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.pitch);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const [pitchId, setPitchId] = useState<string | null>(null);

  const initialValues: PitchFormValues = {
    skills: [''],
    gigDetails: {
      projectType: '',
      budget: 0,
      timeline: '',
      platform: '',
      additionalInfo: '',
    },
  };

  const platformOptions = [
    { value: 'upwork', label: 'Upwork' },
    { value: 'fiverr', label: 'Fiverr' },
    { value: 'freelancer', label: 'Freelancer.com' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Direct Email' },
    { value: 'other', label: 'Other' },
  ];

  const timelineOptions = [
    { value: 'less_than_week', label: 'Less than a week' },
    { value: '1_2_weeks', label: '1-2 weeks' },
    { value: '2_4_weeks', label: '2-4 weeks' },
    { value: '1_3_months', label: '1-3 months' },
    { value: 'more_than_3_months', label: 'More than 3 months' },
  ];

  const handleSubmit = async (
    values: PitchFormValues,
    { setSubmitting }: FormikHelpers<PitchFormValues>
  ) => {
    try {
      dispatch(generatePitchStart());
      const response = await pitchAPI.generatePitch(values.skills, values.gigDetails);
      
      if (response.data) {
        dispatch(generatePitchSuccess(response.data));
        setGeneratedPitch(response.data.generatedPitch);
        setPitchId(response.data.id);
      } else {
        dispatch(generatePitchFailure('Failed to generate pitch'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to generate pitch. Please try again.';
      dispatch(generatePitchFailure(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePitch = async () => {
    if (pitchId) {
      try {
        await pitchAPI.updatePitch(pitchId, { status: 'approved' });
        navigate(`/pitches/${pitchId}`);
      } catch (error) {
        console.error('Error approving pitch:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Generate Pitch
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!generatedPitch ? (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Enter your skills and gig details
          </Typography>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Your Skills
                </Typography>
                
                <FieldArray name="skills">
                  {({ push, remove }) => (
                    <Box>
                      {values.skills.map((skill, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                          <Field
                            as={TextField}
                            name={`skills[${index}]`}
                            label={`Skill ${index + 1}`}
                            fullWidth
                            variant="outlined"
                            error={
                              touched.skills?.[index] && Boolean(errors.skills?.[index])
                            }
                            helperText={
                              touched.skills?.[index] && errors.skills?.[index]
                            }
                          />
                          
                          {index > 0 && (
                            <Button
                              type="button"
                              color="error"
                              sx={{ ml: 1 }}
                              onClick={() => remove(index)}
                            >
                              <RemoveIcon />
                            </Button>
                          )}
                          
                          {index === values.skills.length - 1 && (
                            <Button
                              type="button"
                              color="primary"
                              sx={{ ml: 1 }}
                              onClick={() => push('')}
                            >
                              <AddIcon />
                            </Button>
                          )}
                        </Box>
                      ))}
                      
                      {typeof errors.skills === 'string' && (
                        <FormHelperText error>{errors.skills}</FormHelperText>
                      )}
                    </Box>
                  )}
                </FieldArray>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Gig Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="gigDetails.projectType"
                      label="Project Type"
                      fullWidth
                      variant="outlined"
                      error={
                        touched.gigDetails?.projectType &&
                        Boolean(errors.gigDetails?.projectType)
                      }
                      helperText={
                        touched.gigDetails?.projectType && errors.gigDetails?.projectType
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="gigDetails.budget"
                      label="Budget"
                      type="number"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      error={
                        touched.gigDetails?.budget &&
                        Boolean(errors.gigDetails?.budget)
                      }
                      helperText={
                        touched.gigDetails?.budget && errors.gigDetails?.budget
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={
                        touched.gigDetails?.timeline &&
                        Boolean(errors.gigDetails?.timeline)
                      }
                    >
                      <InputLabel id="timeline-label">Timeline</InputLabel>
                      <Field
                        as={Select}
                        labelId="timeline-label"
                        name="gigDetails.timeline"
                        label="Timeline"
                      >
                        {timelineOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.gigDetails?.timeline && errors.gigDetails?.timeline && (
                        <FormHelperText>{errors.gigDetails.timeline}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={
                        touched.gigDetails?.platform &&
                        Boolean(errors.gigDetails?.platform)
                      }
                    >
                      <InputLabel id="platform-label">Platform</InputLabel>
                      <Field
                        as={Select}
                        labelId="platform-label"
                        name="gigDetails.platform"
                        label="Platform"
                      >
                        {platformOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.gigDetails?.platform && errors.gigDetails?.platform && (
                        <FormHelperText>{errors.gigDetails.platform}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="gigDetails.additionalInfo"
                      label="Additional Information"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Add any specific requirements or details about the project"
                      error={
                        touched.gigDetails?.additionalInfo &&
                        Boolean(errors.gigDetails?.additionalInfo)
                      }
                      helperText={
                        touched.gigDetails?.additionalInfo && errors.gigDetails?.additionalInfo
                      }
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting || loading}
                    sx={{ minWidth: 200, py: 1.5 }}
                  >
                    {(isSubmitting || loading) ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Generate Pitch'
                    )}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      ) : (
        <Box>
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Generated Pitch
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mt: 2,
                  mb: 3,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography variant="body1">{generatedPitch}</Typography>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setGeneratedPitch(null)}
                >
                  Regenerate
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApprovePitch}
                >
                  Approve and Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default PitchGenerator;
