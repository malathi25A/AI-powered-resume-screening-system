// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 120000, // 2 minutes for AI evaluation
});

// ── Request Interceptor — Attach JWT ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smarthire_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response Interceptor — Handle 401 ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('smarthire_token');
      localStorage.removeItem('smarthire_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
