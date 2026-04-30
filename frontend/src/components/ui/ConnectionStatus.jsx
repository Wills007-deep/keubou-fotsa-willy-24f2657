import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionState, warmupServer, resetServerStatus } from '../../api.js';

/**
 * ConnectionStatus — Composant qui affiche l'état de connexion au serveur.
 * Remplace le spinner générique par des messages contextuels.
 * 
 * Props:
 *  - onRetry: callback quand l'utilisateur clique "Réessayer"
 *  - compact: affichage compact (bandeau) vs plein écran
 */
export default function ConnectionStatus({ onRetry, compact = false }) {
  const [state, setState] = useState(ConnectionState.current);
  const [attempt, setAttempt] = useState(ConnectionState.attempt);
  const [retrying, setRetrying] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    return ConnectionState.subscribe((newState, newAttempt) => {
      setState(newState);
      setAttempt(newAttempt);
    });
  }, []);

  // Animation des points de chargement
  useEffect(() => {
    if (state === 'warming' || state === 'connecting') {
      const interval = setInterval(() => {
        setDots(d => d.length >= 3 ? '' : d + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [state]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    resetServerStatus();
    const success = await warmupServer();
    setRetrying(false);
    if (success && onRetry) {
      onRetry();
    }
  }, [onRetry]);

  if (state === 'online' || state === 'idle') return null;

  const maxAttempts = ConnectionState.maxAttempts;

  // ── Mode compact (bandeau en haut) ──
  if (compact) {
    return (
      <div className={`w-full px-4 py-2 text-center text-sm font-bold rounded-xl mb-4 flex items-center justify-center gap-2 transition-all duration-300 ${
        state === 'offline' 
          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      }`}>
        {state === 'offline' ? (
          <>
            <span className="material-symbols-outlined text-base">cloud_off</span>
            <span>Serveur hors ligne</span>
            <button 
              onClick={handleRetry} 
              disabled={retrying}
              className="ml-2 px-3 py-0.5 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {retrying ? '...' : 'Réessayer'}
            </button>
          </>
        ) : (
          <>
            <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Réveil du serveur ({attempt}/{maxAttempts}){dots}</span>
          </>
        )}
      </div>
    );
  }

  // ── Mode plein écran ──
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center gap-6">
      {state === 'warming' && (
        <>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-200 dark:border-amber-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>cloud_sync</span>
            </div>
          </div>
          <div className="space-y-2 text-center max-w-sm">
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Réveil du serveur ({attempt}/{maxAttempts}){dots}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
              Le serveur sort de son mode veille. Sur les réseaux **Orange/MTN**, cela peut nécessiter plusieurs tentatives de connexion.
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[1,2,3,4,5].map(i => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {state === 'offline' && (
        <>
          <div className="relative">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500 text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>cloud_off</span>
            </div>
          </div>
          <div className="space-y-4 text-center max-w-sm px-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
                Serveur injoignable
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Impossible d'établir une connexion stable après {maxAttempts} tentatives.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">💡 Conseils Orange/MTN :</p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Désactivez et réactivez vos données mobiles.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Si vous utilisez un VPN, essayez de le désactiver.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  Vérifiez que votre crédit Data n'est pas épuisé.
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={handleRetry}
            disabled={retrying}
            className="mt-2 bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {retrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Tentative 1/{maxAttempts}...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">refresh</span>
                Forcer une nouvelle tentative
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

