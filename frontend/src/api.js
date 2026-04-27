import axios from 'axios';

// URL de production Render
const API_URL = import.meta.env.VITE_API_URL || 'https://keubou-fotsa-willy-24f2657.onrender.com/api';

// Configuration de l'instance Axios
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 secondes pour laisser le temps à Render de se réveiller (Cold Start)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Système de Retry (Réessais automatiques en cas d'erreur réseau ou timeout)
apiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  
  // Si on n'a plus de config ou si on a déjà trop essayé (max 3 tentatives)
  if (!config || config.__retryCount >= 3) {
    return Promise.reject(error);
  }

  // Vérifier si c'est une erreur de réseau ou un timeout
  const isNetworkError = !response;
  const isServerWakingUp = response && (response.status === 503 || response.status === 504 || response.status === 502);

  if (isNetworkError || isServerWakingUp) {
    config.__retryCount = config.__retryCount || 0;
    config.__retryCount += 1;

    console.warn(`Tentative de reconnexion ${config.__retryCount}/3 pour Render...`);
    
    // Délai progressif entre les tentatives (2s, 4s, 8s)
    const delay = Math.pow(2, config.__retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return apiClient(config);
  }

  return Promise.reject(error);
});

export default apiClient;
