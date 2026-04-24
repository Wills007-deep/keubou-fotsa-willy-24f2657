import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_BASE = "http://localhost:8000/api";

export default function Accueil() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, collectesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/`),
        axios.get(`${API_BASE}/collectes/?skip=0&limit=100`)
      ]);
      setStats(statsRes.data || {});
      setCollectes(collectesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setStats({});
      setCollectes([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return { name: 'Printemps', prog: 65, desc: 'Période de croissance active.' };
    if (month >= 5 && month <= 7) return { name: 'Été', prog: 85, desc: 'Période de maturation et récolte.' };
    if (month >= 8 && month <= 10) return { name: 'Automne', prog: 30, desc: 'Préparation des sols et semis.' };
    return { name: 'Hiver', prog: 10, desc: 'Repos végétatif et maintenance.' };
  };

  const season = getCurrentSeason();
  const avgYield = stats?.moyennes_rendement_par_culture?.length > 0
    ? (stats.moyennes_rendement_par_culture.reduce((sum, c) => sum + c.rendement_moyen, 0) / stats.moyennes_rendement_par_culture.length).toFixed(2)
    : 0;

  const getActivityData = () => {
    const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = collectes.filter(c => new Date(c.created_at).toDateString() === date.toDateString()).length;
      data.push({ day: days[date.getDay()], count });
    }
    return data;
  };

  const activityData = getActivityData();

  if (loading) return <div className="p-12 text-center font-bold text-primary">Initialisation du centre de pilotage...</div>;

  return (
    <div className="w-full">
      {/* ... Hero Section unchanged ... */}
      <section className="grid grid-cols-12 gap-gutter mb-xl">
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
          <h1 className="font-h1 text-h1 text-slate-900 dark:text-white mb-md">Nourrir demain avec la précision d'aujourd'hui.</h1>
          <p className="font-body-lg text-body-lg text-slate-600 dark:text-slate-300 max-w-2xl mb-lg">
            Bienvenue dans votre centre de pilotage AgroAnalytics. Optimisez vos rendements grâce à une collecte de données précise et une analyse saisonnière en temps réel.
          </p>
          <div className="flex gap-md">
            <Link 
              to="/formulaire"
              className="bg-emerald-900 dark:bg-emerald-600 text-white font-bold px-8 py-4 rounded-16 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
              Nouvelle Collecte
            </Link>
            <Link 
              to="/dashboard"
              className="border border-emerald-900 text-emerald-900 dark:border-emerald-400 dark:text-emerald-400 font-semibold px-8 py-4 rounded-16 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center"
            >
              Voir les analyses
            </Link>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <div className="relative h-[250px] md:h-[400px] w-full rounded-16 overflow-hidden shadow-[0px_4px_20px_rgba(27,67,50,0.08)] bg-emerald-100">
            <img 
              alt="Modern Farm" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZxLLCE0-cqItewveWId4LB-_sAXr40m4Pg73XwhATo22mnCxAo4lrCIkfRq2NrJcr6Sao6MilQ3jhaDUGKMWhzotoDeTaAnsAfBiuxX5vm9QgY31gExmVoCvDl6rtQ569owmyY_9mQgGZYkj_ii83htkvKPdYRqC6-GOWN23qibzvPM54Eym2nhuLKtPDJXd9SLPabfvm5o7koUz9SIZwxbmaCOI0KqjE0Bg7Dvrdbd5njbcqph1dsBQK26-imB-JjVI-fWhGzEcP"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>sensors</span>
                <span className="font-label-caps text-on-secondary-fixed-variant">STATION MÉTÉO ACTIVE</span>
              </div>
              <p className="font-body-md text-emerald-900 mt-1">Sols : Humidité optimale (24%)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-white dark:bg-slate-900 p-lg rounded-16 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-md">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
              <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400">calendar_today</span>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-label-caps uppercase">{season.name}</span>
          </div>
          <h3 className="font-h3 text-h3 text-emerald-900 dark:text-emerald-100 mb-sm">Saison : {season.name}</h3>
          <p className="font-body-md text-slate-500 dark:text-slate-400 mb-lg">{season.desc}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${season.prog}%` }}></div>
          </div>
          <p className="mt-2 font-label-caps text-slate-400 text-[10px]">Progression saisonnière : {season.prog}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-lg rounded-16 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-md">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
              <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400">monitoring</span>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-label-caps uppercase">{avgYield > 5 ? 'OPTIMAL' : 'À SURVEILLER'}</span>
          </div>
          <h3 className="font-h3 text-h3 text-emerald-900 dark:text-emerald-100 mb-sm">Santé des parcelles</h3>
          <p className="font-body-md text-slate-500 dark:text-slate-400 mb-lg">Rendement moyen actuel à <span className="font-bold text-emerald-500">{avgYield} t/ha</span> sur l'ensemble de vos parcelles.</p>
          <div className="flex items-baseline gap-2">
            <span className="font-data-display text-emerald-900 dark:text-emerald-100">{stats?.total_collectes || 0}</span>
            <span className="font-body-md text-slate-400">parcelles suivies</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-lg rounded-16 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-md">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
              <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400">assignment</span>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-label-caps uppercase">Statut</span>
          </div>
          <h3 className="font-h3 text-h3 text-emerald-900 dark:text-emerald-100 mb-sm">Dernière Collecte</h3>
          <p className="font-body-md text-slate-500 dark:text-slate-400 mb-lg">
            {collectes.length > 0 
              ? `Dernière saisie effectuée le ${new Date(collectes[0].created_at).toLocaleDateString('fr-FR')} pour ${collectes[0].culture_type}.`
              : "Aucune collecte enregistrée pour le moment."
            }
          </p>
          <Link to="/collectes" className="w-full block text-center py-2 border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors font-body-md">
            Voir l'historique
          </Link>
        </div>
      </section>

      {/* Activity Section */}
      <section className="mt-xl grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-lg rounded-16 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-h3 text-h3 text-emerald-900 dark:text-emerald-100">Activité de Collecte</h3>
            <div className="px-4 py-2 bg-emerald-50 dark:bg-slate-800 rounded-lg font-body-md text-emerald-800 dark:text-emerald-200 font-bold text-xs uppercase tracking-widest">
              Derniers 7 jours
            </div>
          </div>
          <div className="h-64 w-full bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(16, 185, 129, 0.05)'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#10b981' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-emerald-900 dark:bg-emerald-600 text-white p-lg rounded-16 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-label-caps opacity-80 mb-sm">CONSEIL IA</h4>
              <p className="font-h3 text-lg mb-lg">Optimisez vos rendements en planifiant vos prochaines récoltes.</p>
              <Link to="/dashboard" className="w-full bg-white text-emerald-900 font-bold py-3 rounded-xl active:scale-95 transition-transform font-body-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">insights</span>
                Analyse IA
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]">smart_toy</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-lg rounded-16 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <div className="flex items-center gap-3 mb-md">
              <span className="material-symbols-outlined text-emerald-500" style={{fontVariationSettings: "'FILL' 1"}}>cloud</span>
              <h4 className="font-h3 text-lg text-emerald-900 dark:text-emerald-100">Météo Locale</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-data-display text-emerald-900 dark:text-emerald-100">24°C</span>
                <p className="text-sm text-slate-400">Ciel dégagé • Douala</p>
              </div>
              <span className="material-symbols-outlined text-amber-400 text-[48px]">wb_sunny</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
