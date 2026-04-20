import axios from 'axios';

// Since we are running the React dev server locally separate from Django,
// we will point directly to the Django server. In production this might be different.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/',
  withCredentials: true, // For Session Auth/CSRF if needed
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
