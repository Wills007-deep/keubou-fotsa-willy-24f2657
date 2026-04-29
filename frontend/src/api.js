import axios from 'axios';

// URL Proxy Cloudflare (pour contourner les instabilités Orange/MTN)
const API_URL = 'https://agro-proxy.willsbusiness88.workers.dev/api';

// ========================================================================
// État de connexion global — permet aux composants de réagir intelligemment
// ========================================================================
let _connectionState = 'idle'; // idle | connecting | warming | online | offline
let _currentAttempt = 0;
const MAX_ATTEMPTS = 25;
const _listeners = new Set();

export const ConnectionState = {
  get current() { return _connectionState; },
  get attempt() { return _currentAttempt; },
  get maxAttempts() { return MAX_ATTEMPTS; },
  subscribe(fn) { _listeners.add(fn); return () => _listeners.delete(fn); },
  _set(state, attempt = 0) {
    _currentAttempt = attempt;
    if (_connectionState !== state || _currentAttempt !== attempt) {
      _connectionState = state;
      _listeners.forEach(fn => fn(state, attempt));
    }
  }
};

// ========================================================================
// Configuration Axios — timeout court pour compatibilité Orange/MTN
// ========================================================================
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000, // Augmenté à 20s pour les réseaux très lents
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================================================
// Warm-up du serveur Render (cold start)
// On ping /api/health AVANT les vraies requêtes.
// ========================================================================
let _serverReady = false;
let _warmupPromise = null;

export async function warmupServer() {
  if (_serverReady) return true;
  if (_warmupPromise) return _warmupPromise;

  _warmupPromise = _doWarmup();
  const result = await _warmupPromise;
  _warmupPromise = null;
  return result;
}

async function _doWarmup() {
  ConnectionState._set('warming', 1);
  
  // Jusqu'à 25 tentatives (patience de ~4-5 minutes si nécessaire)
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      _currentAttempt = attempt;
      ConnectionState._set('warming', attempt);
      console.log(`[AgroAPI] Warmup tentative ${attempt}/${MAX_ATTEMPTS}...`);
      
      // On ping la racine du backend avec un timeout de 12s
      await axios.get(API_URL.replace('/api', '') + '/', { 
        timeout: 12000, 
        headers: { 'Accept': 'application/json' }
      });
      
      _serverReady = true;
      ConnectionState._set('online');
      console.log(`[AgroAPI] Serveur en ligne après ${attempt} tentative(s)`);
      return true;
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
      console.warn(`[AgroAPI] Tentative ${attempt} : ${isTimeout ? 'Timeout' : err.message}`);
      
      if (attempt < MAX_ATTEMPTS) {
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
