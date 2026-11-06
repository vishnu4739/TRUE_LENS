import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('truelens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.message ||
      error.response?.data?.detail;

    if (!message) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        message = 'Cannot reach backend server. Please make sure the TrueLens backend is started on port 5000, or open http://localhost:5173.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
