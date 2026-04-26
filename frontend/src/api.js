import axios from 'axios';

// Utilise l'URL Render en production (Vercel) et localhost en développement
const API_URL = import.meta.env.VITE_API_URL || 'https://keubou-fotsa-willy-24f2657.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCollectes = () => api.get('/collectes/');
export const createCollecte = (data) => api.post('/collectes/', data);
export const getStats = () => api.get('/stats/');
