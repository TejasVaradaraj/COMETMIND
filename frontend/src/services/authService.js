import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async signup(name, email, password) {
    try {
      const response = await api.post('/api/auth/signup', { name, email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  },

  async googleLogin(token) {
    try {
      const response = await api.post('/api/auth/google-login', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Google login failed');
    }
  }
};

export default api;