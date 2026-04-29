import axios from 'axios';

// URL Proxy Cloudflare (pour contourner les instabilités Orange/MTN)
const API_URL = 'https://agro-proxy.willsbusiness88.workers.dev/api';

// État de connexion simplifié
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
  }
};

const apiClient = axios.create({
  baseURL: API_URL,
        // Pause entre les tentatives (progressive)
        const delay = Math.min(1000 + (attempt * 100), 2500);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  ConnectionState._set('offline');
  console.error(`[AgroAPI] Serveur injoignable après ${MAX_ATTEMPTS} tentatives`);
  return false;
}

// Permet de forcer un re-check
export function resetServerStatus() {
  _serverReady = false;
  _warmupPromise = null;
  ConnectionState._set('idle');
}

// ========================================================================
// Intercepteur de retry — max 3 retries
// ========================================================================
apiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  
  if (!config || config.__retryCount >= 3) {
    ConnectionState._set('offline');
    return Promise.reject(error);
  }

  const isNetworkError = !response;
  const isServerWakingUp = response && (response.status === 503 || response.status === 504 || response.status === 502);

  if (isNetworkError || isServerWakingUp) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    console.warn(`[AgroAPI] Retry ${config.__retryCount}/3 pour ${config.url}...`);
    
    const delay = config.__retryCount * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    _serverReady = false;
    return apiClient(config);
  }

  return Promise.reject(error);
});

// ========================================================================
// Intercepteur de requête — warmup automatique
// ========================================================================
apiClient.interceptors.request.use(async (config) => {
  if (!_serverReady) {
    const ready = await warmupServer();
    if (!ready) {
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      return config;
    }
  }
  ConnectionState._set('online');
  return config;
});


export default apiClient;
