import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string, displayName: string) =>
    api.post('/auth/register', { email, password, displayName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  getSubscription: () => api.get('/users/subscription'),
  
  updateSubscription: (tier: string) =>
    api.put('/users/subscription', { tier }),
};

// Pitch API
export const pitchAPI = {
  generatePitch: (skills: string[], gigDetails: any) =>
    api.post('/pitches/generate', { skills, gigDetails }),
  
  getPitches: (status?: string, limit?: number, offset?: number) => {
    let url = '/pitches';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    return api.get(url);
  },
  
  getPitchById: (id: string) => api.get(`/pitches/${id}`),
  
  updatePitch: (id: string, data: any) => api.put(`/pitches/${id}`, data),
  
  deletePitch: (id: string) => api.delete(`/pitches/${id}`),
  
  schedulePitch: (id: string, data: any) =>
    api.post(`/pitches/${id}/schedule`, data),
};

// Calendar API
export const calendarAPI = {
  authorizeCalendar: () => api.post('/calendar/authorize'),
  
  getEvents: (startDate?: string, endDate?: string, limit?: number) => {
    let url = '/calendar/events';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    return api.get(url);
  },
  
  createEvent: (data: any) => api.post('/calendar/events', data),
  
  updateEvent: (id: string, data: any) =>
    api.put(`/calendar/events/${id}`, data),
  
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),
};

export default api;
