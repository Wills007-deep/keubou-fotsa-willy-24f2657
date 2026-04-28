import axios from 'axios';

// URL de production Render
const API_URL = import.meta.env.VITE_API_URL || 'https://keubou-fotsa-willy-24f2657.onrender.com/api';

// ========================================================================
// État de connexion global — permet aux composants de réagir intelligemment
// ========================================================================
let _connectionState = 'idle'; // idle | connecting | warming | online | offline
const _listeners = new Set();

export const ConnectionState = {
  get current() { return _connectionState; },
  subscribe(fn) { _listeners.add(fn); return () => _listeners.delete(fn); },
  _set(state) {
    if (_connectionState !== state) {
      _connectionState = state;
      _listeners.forEach(fn => fn(state));
    }
  }
};

// ========================================================================
// Configuration Axios — timeout court pour compatibilité Orange/MTN
// ========================================================================
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — compatible avec les réseaux mobiles africains (Orange coupe à ~20-30s)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================================================
// Warm-up du serveur Render (cold start)
// On ping /api/health AVANT les vraies requêtes.
// Utilise des requêtes courtes et répétées plutôt qu'une seule longue.
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
  ConnectionState._set('warming');
  
  // Essayer jusqu'à 10 fois avec un timeout court (7s)
  // Total possible: 70s de patience, mais découpé en petits morceaux de 7s
  // pour éviter que Orange/MTN ne tue la connexion globale.
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[AgroAPI] Warmup tentative ${attempt}/${MAX_ATTEMPTS}...`);
      // On ping la racine du backend
      await axios.get(API_URL.replace('/api', '') + '/', { 
        timeout: 7000, 
        headers: { 'Accept': 'application/json' }
      });
      
      _serverReady = true;
      ConnectionState._set('online');
      console.log(`[AgroAPI] Serveur en ligne après ${attempt} tentative(s)`);
      return true;
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
      console.warn(`[AgroAPI] Tentative ${attempt} : ${isTimeout ? 'Timeout (le serveur se réveille encore)' : err.message}`);
      
      // Pause progressive entre les tentatives
      if (attempt < MAX_ATTEMPTS) {
        const delay = Math.min(1000 + (attempt * 200), 2000);
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
// Intercepteur de retry — max 2 retries avec timeout court
// ========================================================================
apiClient.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  
  if (!config || config.__retryCount >= 2) {
    ConnectionState._set('offline');
    return Promise.reject(error);
  }

  const isNetworkError = !response;
  const isServerWakingUp = response && (response.status === 503 || response.status === 504 || response.status === 502);

  if (isNetworkError || isServerWakingUp) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    console.warn(`[AgroAPI] Retry ${config.__retryCount}/2 pour ${config.url}...`);
    
    // Délai court entre les tentatives (1.5s, 3s)
    const delay = config.__retryCount * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Marquer le serveur comme non-prêt pour forcer un warmup au prochain appel
    _serverReady = false;
    
    return apiClient(config);
  }

  return Promise.reject(error);
});

// ========================================================================
// Intercepteur de requête — warmup automatique avant chaque requête
// ========================================================================
apiClient.interceptors.request.use(async (config) => {
  if (!_serverReady) {
    ConnectionState._set('connecting');
    const ready = await warmupServer();
    if (!ready) {
      // Annuler la requête proprement
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
