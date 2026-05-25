import axios from 'axios';

// Since we are running the React dev server locally separate from Django,
// we will point directly to the Django server. In production this might be different.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://flipko.onrender.com/api/',
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

// Add a response interceptor to handle 401 errors (expired tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Remove the Authorization header and retry the request
      delete originalRequest.headers.Authorization;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
