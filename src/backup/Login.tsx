import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, Link, CircularProgress } from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      dispatch(loginStart());
      const response = await authAPI.login(values.email, values.password);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        dispatch(loginSuccess(response.data.user));
        navigate('/dashboard');
      } else {
        dispatch(loginFailure('Login failed'));
        setGeneralError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(errorMessage));
      setGeneralError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Sign In
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting || loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {(isSubmitting || loading) ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" onClick={() => navigate('/register')}>
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Login;
