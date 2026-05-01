import axios from 'axios';

// Since we are running the React dev server locally separate from Django,
// we will point directly to the Django server. In production this might be different.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true, // For Session Auth/CSRF if needed
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to inject the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
