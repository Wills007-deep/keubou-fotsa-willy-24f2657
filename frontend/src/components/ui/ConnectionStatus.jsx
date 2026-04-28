import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionState, warmupServer, resetServerStatus } from '../../api';

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
  const [retrying, setRetrying] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    return ConnectionState.subscribe(setState);
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
            <span>Connexion au serveur{dots}</span>
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
              Réveil du serveur{dots}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Le serveur est en mode économie d'énergie. Il se réveille, cela prend quelques secondes.
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

      {state === 'connecting' && (
        <>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">cell_tower</span>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Connexion en cours{dots}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Tentative de connexion au serveur AgroAnalytics.
            </p>
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
          <div className="space-y-2 text-center max-w-sm">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
              Serveur indisponible
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Impossible de joindre le serveur. Vérifiez votre connexion internet ou réessayez dans quelques instants.
            </p>
          </div>
          <button 
            onClick={handleRetry}
            disabled={retrying}
            className="mt-2 bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {retrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">refresh</span>
                Réessayer
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
            💡 Astuce : Si vous êtes sur Orange/MTN, essayez de désactiver puis réactiver vos données mobiles.
          </p>
        </>
      )}
    </div>
  );
}
