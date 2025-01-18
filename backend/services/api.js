import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her istekte otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const atikTurleri = {
  getAll: () => api.get('/atik-turleri'),
};

export const materyal = {
  add: (materyalData) => api.post('/materyal', materyalData),
  getUserMateryaller: () => api.get('/materyal'),
};

export const geriDonusum = {
  add: (islemData) => api.post('/geri-donusum', islemData),
  getUserIslemler: () => api.get('/geri-donusum'),
};

export default {
  auth,
  atikTurleri,
  materyal,
  geriDonusum,
}; 