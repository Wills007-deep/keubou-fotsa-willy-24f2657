import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || username.length < 3) {
      setError("L'identifiant doit contenir au moins 3 caractères.");
      return;
    }
    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('Le PIN doit contenir exactement 4 chiffres.');
      return;
    }
    if (mode === 'register' && pin !== pinConfirm) {
      setError('Les deux PIN ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await login(username, pin);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur. Vérifiez votre identifiant et PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
            <span className="material-symbols-outlined text-2xl">potted_plant</span>
          </div>
          <span className="text-2xl font-black text-primary dark:text-emerald-100 tracking-tight">AgroAnalytics</span>
        </div>
        <h2 className="text-2xl font-black text-emerald-900 dark:text-white">
          {mode === 'login' ? 'Bon retour !' : 'Créer votre compte'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {mode === 'login' ? 'Connectez-vous avec votre identifiant et PIN' : 'Choisissez un identifiant et un PIN de 4 chiffres'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Créer un compte
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-emerald-900/5 rounded-3xl border border-emerald-900/5 dark:border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            {/* Aide contextuelle */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-3 rounded-xl">
              <p className="text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed">
                {mode === 'login' ? (
                  <>Entrez votre identifiant (ex: <strong>jean01</strong>) et votre PIN à 4 chiffres.</>
                ) : (
                  <>Choisissez un identifiant unique : <strong>Prénom + 2 chiffres</strong> (ex: <strong>jean01</strong>), puis un PIN à 4 chiffres.</>
                )}
              </p>
            </div>

            {/* Identifiant */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Identifiant
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-bold"
                placeholder="Ex: jean01"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                PIN (4 chiffres)
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-bold text-center tracking-[1em]"
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showPin ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm PIN (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Confirmer le PIN
                </label>
                <div className="relative">
                  <input
                    type={showPinConfirm ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                    className="block w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-bold text-center tracking-[1em]"
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinConfirm(!showPinConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showPinConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none text-sm font-black text-white bg-primary hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          Plateforme AgroAnalytics — TP 2026
        </p>
      </div>
    </div>
  );
}
