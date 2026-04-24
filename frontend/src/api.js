import axios from 'axios';

// On utilise 127.0.0.1 au lieu de localhost pour éviter les problèmes de résolution DNS sur Linux
const API_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCollectes = () => api.get('/collectes/');
export const createCollecte = (data) => api.post('/collectes/', data);
export const getStats = () => api.get('/stats/');
