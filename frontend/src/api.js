import axios from 'axios';

// URL Proxy Cloudflare (pour contourner les instabilités Orange/MTN)
const API_URL = 'https://agro-proxy.willsbusiness88.workers.dev/api';

// État de connexion simplifié pour le UI
export const ConnectionState = {
  current: 'online',
  listeners: [],
  subscribe(callback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  },
  update(state) {
    this.current = state;
    this.listeners.forEach(l => l(state));
  },
  _set(state) { // Alias pour compatibilité avec le reste du code
    this.update(state);
  }
};

let _serverReady = false;
let _warmupPromise = null;
const MAX_ATTEMPTS = 25;

/**
 * Tente de réveiller le serveur si celui-ci est en "cold start"
 * ou via le proxy Cloudflare.
 */
async function warmupServer() {
  if (_serverReady) return true;
  if (_warmupPromise) return _warmupPromise;

  _warmupPromise = (async () => {
    console.log("[AgroAPI] Vérification de la disponibilité du serveur...");
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        ConnectionState.update(`warmup:${attempt}/${MAX_ATTEMPTS}`);
        
        // On ping l'endpoint de santé du backend (via le proxy)
        await axios.get(`${API_URL}/health`, { timeout: 8000 });
        
        console.log("[AgroAPI] Serveur prêt !");
        _serverReady = true;
        ConnectionState.update('online');
        return true;
      } catch (err) {
        // Si c'est un 503/502, le serveur est probablement en train de démarrer ou suspendu
        console.warn(`[AgroAPI] Tentative ${attempt} échouée...`);
        
        if (attempt === MAX_ATTEMPTS) break;
        
        // Pause progressive entre les tentatives
        const delay = Math.min(1000 + (attempt * 200), 3000);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    ConnectionState.update('offline');
    console.error(`[AgroAPI] Serveur injoignable après ${MAX_ATTEMPTS} tentatives. Vérifiez l'état du backend.`);
    _warmupPromise = null;
    return false;
  })();

  return _warmupPromise;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Augmenté pour les réseaux mobiles lents
});

// Permet de forcer un re-check de l'état du serveur
export function resetServerStatus() {
  _serverReady = false;
  _warmupPromise = null;
  ConnectionState.update('idle');
}

// ========================================================================
// Intercepteur de retry — pour gérer les micro-coupures
// ========================================================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Si on a déjà trop tenté, on arrête
    if (!config || config.__retryCount >= 3) {
      if (!response || response.status >= 500) {
        ConnectionState.update('offline');
      }
      return Promise.reject(error);
    }

    const isNetworkError = !response;
    const isServerError = response && (response.status === 503 || response.status === 504 || response.status === 502);

    if (isNetworkError || isServerError) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      console.warn(`[AgroAPI] Retry ${config.__retryCount}/3 pour ${config.url}...`);
      
      const delay = config.__retryCount * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // On invalide l'état prêt pour forcer un re-warmup si besoin sur la prochaine requête
      _serverReady = false;
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

// ========================================================================
// Intercepteur de requête — warmup automatique avant l'envoi
// ========================================================================
apiClient.interceptors.request.use(async (config) => {
  // On ne fait pas de warmup pour le ping de santé lui-même
  if (!_serverReady && !config.url?.includes('/health')) {
    const ready = await warmupServer();
    if (!ready) {
      // Si le serveur ne répond vraiment pas, on annule la requête
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      return config;
    }
  }
  return config;
});

export default apiClient;
