import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://127.0.0.1:8000/api';
const COLORS = ['#2d6a4f', '#95d4b3', '#b0f1cc', '#a5d0b9', '#c1ecd4', '#3f6754'];

export default function Dashboard() {
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
        axios.get(`${API_BASE}/collectes/?skip=0&limit=1000`)
      ]);
      setStats(statsRes.data);
      setCollectes(collectesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCultureDistribution = () => {
    const distribution = {};
    collectes.forEach(c => {
      distribution[c.culture_type] = (distribution[c.culture_type] || 0) + 1;
    });
    return Object.entries(distribution).map(([culture, count]) => ({
      name: culture,
      value: count
    }));
  };

  const getScatterData = () => {
    return collectes.map(c => ({
      x: c.quantite_engrais || 0,
      y: c.rendement_final || 0,
      culture: c.culture_type
    }));
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center">Chargement des données...</div>
      </div>
    );
  }

  const totalCollectes = collectes.length;
  const avgYield = totalCollectes > 0 
    ? (collectes.reduce((sum, c) => sum + c.rendement_final, 0) / totalCollectes).toFixed(2)
    : 0;
  const totalSurface = totalCollectes > 0
    ? collectes.reduce((sum, c) => sum + c.surface, 0).toFixed(1)
    : 0;
  const correlationIndex = 0.848;

  return (
    <>
      <div className="w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-secondary-fixed-variant mb-1">Analyse Descriptive</h1>
              <p className="font-body-md text-on-surface-variant">Projet INF 232 • Focus sur la performance des rendements agricoles</p>
            </div>
            <button className="bg-primary hover:bg-primary-container text-on-primary font-bold px-6 py-3 rounded-[16px] shadow-[0px_4px_20px_rgba(27,67,50,0.15)] flex items-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined">file_download</span>
              Exporter le rapport d'analyse
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-[16px] p-4 mb-8 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-emerald-800">filter_list</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Filtres</span>
            </div>
            <select className="bg-surface border-outline-variant rounded-xl text-sm font-medium text-on-surface focus:ring-primary focus:border-primary px-4 py-2">
              <option>Type de culture: Tous</option>
              <option>Maïs</option>
              <option>Blé</option>
              <option>Soja</option>
            </select>
            <select className="bg-surface border-outline-variant rounded-xl text-sm font-medium text-on-surface focus:ring-primary focus:border-primary px-4 py-2">
              <option>Période: 12 derniers mois</option>
              <option>Saison 2023</option>
              <option>Saison 2022</option>
            </select>
            <div className="ml-auto flex gap-2">
              <span className="bg-on-secondary-container text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="h-2 w-2 bg-white rounded-full"></span> Temps réel
              </span>
            </div>
          </div>

          {/* Bento Grid Dashboard */}
          <div className="grid grid-cols-12 gap-gutter">
            {/* Main Scatter Plot Card */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-h3 text-h3 text-on-secondary-fixed-variant">Corrélation Rendement vs Fertilisants</h3>
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">info</span>
                  <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">more_vert</span>
                </div>
              </div>
              <div className="flex-grow bg-emerald-50/20 rounded-[16px] min-h-[350px] relative overflow-hidden p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                      <linearGradient id="scatterGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f5238" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0f5238" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(27,67,50,0.1)" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Engrais" 
                      unit="kg" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#707973', fontSize: 12}}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Rendement" 
                      unit="t" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#707973', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                      cursor={{ strokeDasharray: '3 3' }} 
                    />
                    <Scatter 
                      name="Données" 
                      data={getScatterData()} 
                      fill="#0f5238" 
                      line={{stroke: '#2d6a4f', strokeWidth: 2}}
                      shape="circle"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Histogram Card */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex flex-col gap-4">
              <h3 className="font-h3 text-h3 text-on-secondary-fixed-variant">Distribution des Cultures</h3>
              <div className="flex-grow bg-emerald-50/20 rounded-[16px] p-6 flex items-center justify-center min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCultureDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {getCultureDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                   <span className="text-3xl font-bold text-primary">{totalCollectes}</span>
                   <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                </div>
              </div>
            </div>

            {/* KPIs Section */}
            <div className="col-span-12 md:col-span-4 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border-l-4 border-primary">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">RENDEMENT MOYEN</p>
              <div className="flex items-baseline gap-2">
                <span className="font-data-display text-data-display text-on-secondary-fixed-variant">{avgYield}</span>
                <span className="font-body-md text-on-surface-variant">t/ha</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-on-secondary-fixed-variant text-sm font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +12.5% vs an dernier
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)]">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">INDICE DE CONFIANCE</p>
              <div className="flex items-baseline gap-2">
                <span className="font-data-display text-data-display text-on-secondary-fixed-variant">{(correlationIndex * 100).toFixed(1)}</span>
                <span className="font-body-md text-on-surface-variant">%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full mt-4 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${correlationIndex * 100}%` }}></div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex items-center justify-center relative overflow-hidden group">
              <img 
                alt="field visual" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5yzQ0GafbYSs9tU_ZvhkwfNM6P_RHLlSDhIEOjsXBJnqeJCF3EMFGgoJ_soncY9konoDew_ExnbwBKy51RLU4kRxLhEM3JA_-eE96-lSd5yVFYIUybkWwicMpxk-oeA2Acdugzy3Qv7tpatQxR38MLpw2cIL38msqVLI9sOvayQSIIO3rd7MQLxCeJm5NDUyx1dWPWLtmETJn0EzvxYoGpNIVlnwfurswgTtX-ggfZm7SV_aVI-ZjmH9banQbZZKNvOo5mD7vZY_K"
              />
              <div className="relative z-10 text-center">
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">TOTAL PARCELLES</p>
                <span className="font-data-display text-data-display text-on-secondary-fixed-variant">{totalCollectes}</span>
                <p className="text-xs text-on-surface-variant mt-2">Suivi par satellite actif</p>
              </div>
            </div>

            {/* Insights Description Section */}
            <div className="col-span-12 bg-white rounded-[16px] p-lg shadow-[0px_4px_20px_rgba(27,67,50,0.08)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-secondary-container rounded-[12px] flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-on-secondary-fixed-variant">Interprétation Descriptive</h3>
                  <p className="text-on-surface-variant">Analyse automatique générée par AgroAnalytics AI</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    Les données montrent une corrélation positive forte (R² = 0.82) entre l'apport hydrique précoce et le rendement final du maïs. La distribution histogrammique révèle une concentration inhabituelle de rendements records sur le secteur Nord-Est, suggérant une efficacité accrue des nouvelles méthodes de drainage.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="material-symbols-outlined text-emerald-800">check_circle</span>
                    <div>
                      <p className="font-bold text-on-secondary-fixed-variant text-sm">Action Recommandée</p>
                      <p className="text-xs text-on-surface-variant">Ajuster le calendrier de semis pour la zone B afin de maximiser l'exposition aux pics de précipitations d'avril.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}
