import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, Link, CircularProgress } from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../store';
import { registerStart, registerSuccess, registerFailure } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

interface RegisterFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  displayName: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      dispatch(registerStart());
      const response = await authAPI.register(values.email, values.password, values.displayName);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        dispatch(registerSuccess(response.data.user));
        navigate('/dashboard');
      } else {
        dispatch(registerFailure('Registration failed'));
        setGeneralError('Registration failed. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      dispatch(registerFailure(errorMessage));
      setGeneralError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Create Account
      </Typography>
      
      {(error || generalError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || generalError}
        </Alert>
      )}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              fullWidth
              id="displayName"
              name="displayName"
              label="Full Name"
              margin="normal"
              variant="outlined"
              error={touched.displayName && Boolean(errors.displayName)}
              helperText={touched.displayName && errors.displayName}
            />
            
            <Field
              as={TextField}
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              margin="normal"
              variant="outlined"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
            
            <Field
              as={TextField}
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              margin="normal"
              variant="outlined"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
            
            <Field
              as={TextField}
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              margin="normal"
              variant="outlined"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting || loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {(isSubmitting || loading) ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" onClick={() => navigate('/login')}>
                Already have an account? Sign In
              </Link>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Register;
