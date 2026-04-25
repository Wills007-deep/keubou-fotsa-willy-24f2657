import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : 'https://keubou-fotsa-willy-24f2657.onrender.com/api');
const COLORS = ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#064e3b'];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ajout d'un timeout de 15 secondes pour éviter le blocage infini
      const config = { timeout: 15000 };
      
      const [statsRes, collectesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/`, config),
        axios.get(`${API_BASE}/collectes/?skip=0&limit=1000`, config)
      ]);
      
      setStats(statsRes.data || {});
      setCollectes(collectesRes.data || []);
    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.code === 'ECONNABORTED' 
        ? "Le serveur met trop de temps à répondre. Il est peut-être en train de redémarrer." 
        : "Impossible de récupérer les analyses. Vérifiez votre connexion au serveur.");
      setStats({}); 
      setCollectes([]);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const reportElement = reportRef.current;
      // Au lieu de block/none, on utilise la visibilité pour que les graphiques soient rendus
      reportElement.style.position = 'fixed';
      reportElement.style.left = '0';
      reportElement.style.top = '0';
      reportElement.style.zIndex = '-1000';
      reportElement.style.display = 'block';
      
      // Laisser un court délai pour que les graphiques Recharts se dessinent
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });
      
      reportElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`Rapport_AgroAnalytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Erreur lors de la génération du PDF. Réessayez dans quelques instants.");
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
      <div className="w-full h-[80vh] flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center">
           <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-emerald-900 dark:text-emerald-100 font-bold animate-pulse text-sm uppercase tracking-widest">Génération des analyses en cours...</div>
           <p className="text-xs text-slate-400 font-mono">Connexion au serveur : {API_BASE}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-white dark:bg-slate-950 p-8">
        <div className="max-w-md w-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
            <span className="material-symbols-outlined text-3xl">cloud_off</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-red-900 dark:text-red-100">Oups ! Connexion Difficile</h3>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="w-full bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Réessayer la connexion
          </button>
        </div>
      </div>
    );
  }

  const totalCollectes = collectes.length;
  const avgYield = totalCollectes > 0 
    ? (collectes.reduce((sum, c) => sum + c.rendement_final, 0) / totalCollectes).toFixed(2)
    : 0;
  
  const correlationVal = stats?.matrice_correlation?.quantite_engrais?.rendement_final ?? 0;
  const confidenceIndex = (Math.abs(correlationVal) * 100 * Math.min(totalCollectes / 10, 1)).toFixed(1);

  const avgVariance = stats?.moyennes_rendement_par_culture?.length > 0
    ? (stats.moyennes_rendement_par_culture.reduce((sum, c) => sum + (c.rendement_ecart_type ** 2), 0) / stats.moyennes_rendement_par_culture.length).toFixed(2)
    : 0;
  
  const avgStdDev = Math.sqrt(parseFloat(avgVariance)).toFixed(2);

  const lastUpdate = collectes.length > 0 
    ? new Date(Math.max(...collectes.map(c => new Date(c.updated_at || c.created_at)))).toLocaleString('fr-FR')
    : 'N/A';

  return (
    <div className="w-full">
        {/* Hidden Report Template for PDF - TOTAL REDESIGN */}
        <div ref={reportRef} style={{ display: 'none', width: '1000px', padding: '0', backgroundColor: 'white', color: '#1e293b', fontFamily: 'Arial, sans-serif' }}>
           {/* Cover / Header Section */}
           <div style={{ backgroundColor: '#064e3b', color: 'white', padding: '60px 50px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: '#10b981', margin: '0 0 10px 0' }}>AGROANALYTICS PREMIER</p>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, lineHeight: '1.1' }}>RAPPORT DE<br/>PERFORMANCE</h1>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>AgroAnalytics</p>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>Intelligence de Précision</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                  <div>
                    <p style={{ fontSize: '10px', opacity: 0.6, margin: '0 0 5px 0' }}>GÉNÉRÉ LE</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', opacity: 0.6, margin: '0 0 5px 0' }}>UNITÉ DE CONTRÔLE</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>AI Engine v2.4</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', opacity: 0.6, margin: '0 0 5px 0' }}>CONFIDENTIALITÉ</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Strictement Confidentiel</p>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '300px', height: '300px', backgroundColor: '#10b981', borderRadius: '50%', opacity: 0.1 }}></div>
           </div>

           <div style={{ padding: '50px' }}>
              {/* Executive Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '50px' }}>
                  {[
                    { label: 'Rendement Moyen', val: `${avgYield} t/ha`, icon: 'trending_up', color: '#065f46' },
                    { label: 'Indice Corrélation', val: correlationVal.toFixed(2), icon: 'bolt', color: '#059669' },
                    { label: 'Indice Confiance', val: `${confidenceIndex}%`, icon: 'verified', color: '#10b981' },
                    { label: 'Écart-Type', val: avgStdDev, icon: 'analytics', color: '#34d399' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '25px 20px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ fontSize: '24px', fontWeight: '900', color: item.color, margin: 0 }}>{item.val}</p>
                    </div>
                  ))}
              </div>

              {/* Data Visualization Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '50px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                    ANALYSE DE CORRÉLATION (ENGRAIS VS RENDEMENT)
                  </h3>
                  <div style={{ height: '350px', width: '100%' }}>
                      {/* Note: Utiliser des dimensions fixes au lieu de ResponsiveContainer pour l'export PDF */}
                      <ScatterChart width={520} height={350} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" dataKey="x" name="Engrais" unit="kg" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis type="number" dataKey="y" name="Rendement" unit="t" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Scatter name="Parcelles" data={getScatterData()} fill="#10b981" />
                      </ScatterChart>
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                    RÉPARTITION DES CULTURES
                  </h3>
                  <div style={{ height: '350px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <PieChart width={300} height={350}>
                        <Pie data={getCultureDistribution()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                          {getCultureDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div style={{ marginBottom: '50px', padding: '40px', backgroundColor: '#064e3b', borderRadius: '30px', color: 'white', backgroundImage: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>⚡</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Interprétation Analytique AI</h2>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                    <div>
                      <p style={{ fontSize: '15px', lineHeight: '1.7', opacity: 0.9, margin: 0 }}>
                        L'analyse consolidée des données transmises indique une corrélation de <span style={{ color: '#34d399', fontWeight: 'bold' }}>{correlationVal.toFixed(2)}</span>. 
                        {correlationVal > 0.7 
                          ? " Cette performance traduit une efficacité optimale des intrants. Votre stratégie de fertilisation est le moteur principal de votre productivité." 
                          : " Cette valeur suggère que des variables tierces (micro-climat, irrigation ciblée) impactent vos résultats autant que la fertilisation."}
                        La variance de <span style={{ fontWeight: 'bold' }}>{avgVariance}</span> suggère {parseFloat(avgVariance) > 10 ? "une hétérogénéité qui justifie un passage à l'agriculture de précision par parcelle." : "une stabilité exemplaire de votre exploitation."}
                      </p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#34d399', marginBottom: '10px' }}>RECOMMANDATION STRATÉGIQUE</p>
                       <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                         {correlationVal > 0.7 
                           ? "Maintenez vos doses actuelles mais segmentez l'apport pour réduire les pertes de lessivage sur les sols à faible rétention."
                           : "Augmentez la fréquence des relevés sur les types de sols secondaires pour identifier les zones de sous-performance."}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Data Table Section */}
              <div style={{ pageBreakBefore: 'always', marginTop: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '20px' }}>REGISTRE DÉTAILLÉ DES COLLECTES</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                         <th style={{ textAlign: 'left', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>DATE</th>
                         <th style={{ textAlign: 'left', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>PARTICIPANT</th>
                         <th style={{ textAlign: 'left', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>CULTURE</th>
                         <th style={{ textAlign: 'left', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>LOCALISATION</th>
                         <th style={{ textAlign: 'right', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>SURFACE</th>
                         <th style={{ textAlign: 'right', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>ENGRAIS (kg)</th>
                         <th style={{ textAlign: 'right', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>RENDEMENT (t/ha)</th>
                      </tr>
                   </thead>
                   <tbody>
                      {collectes.map((c, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '15px', fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '15px', fontSize: '12px', fontWeight: 'bold', color: '#065f46' }}>{c.participant_name || 'Anonyme'}</td>
                            <td style={{ padding: '15px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{c.culture_type}</td>
                            <td style={{ padding: '15px', fontSize: '12px', color: '#64748b' }}>{c.region || 'N/A'}</td>
                            <td style={{ padding: '15px', fontSize: '12px', textAlign: 'right' }}>{c.surface} ha</td>
                            <td style={{ padding: '15px', fontSize: '12px', textAlign: 'right' }}>{c.quantite_engrais}</td>
                            <td style={{ padding: '15px', fontSize: '12px', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>{c.rendement_final}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>

              <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
                 <p style={{ margin: '0 0 5px 0' }}>Rapport généré automatiquement par le moteur analytique AgroAnalytics AI</p>
                 <p style={{ fontWeight: 'bold' }}>© 2026 AgroAnalytics Pro • www.agroanalytics.com</p>
              </div>
           </div>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-h1 text-h1 text-slate-900 dark:text-white mb-1">Centre Analytique</h1>
            <p className="font-body-md text-slate-500 dark:text-slate-400">Intelligence de précision • Données consolidées</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportPDF}
              className="bg-emerald-50 text-emerald-800 font-bold px-6 py-3 rounded-xl border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              Rapport PDF
            </button>
            <a 
              href={`${API_BASE}/stats/export`}
              className="bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">table_view</span>
              Export Excel
            </a>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-3 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 border-l-4 border-primary">
            <p className="font-label-caps text-[10px] text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">RENDEMENT MOYEN</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{avgYield}</span>
              <span className="text-xs text-slate-400">t/ha</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <p className="font-label-caps text-[10px] text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">INDICE DE CONFIANCE</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{confidenceIndex}%</span>
              <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{width: `${confidenceIndex}%`}}></div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <p className="font-label-caps text-[10px] text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">COLLECTES TOTALES</p>
            <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{totalCollectes}</span>
          </div>

          <div className="col-span-12 md:col-span-3 bg-emerald-900 dark:bg-emerald-600 text-white rounded-[16px] p-6 shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">DERNIÈRE MISE À JOUR</p>
                <p className="text-sm font-bold">{lastUpdate}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px]">
                   <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                   SYSTÈME EN LIGNE
                </div>
             </div>
             <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] opacity-10">update</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-emerald-500">analytics</span> Corrélation Rendement / Engrais
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis type="number" dataKey="x" name="Engrais" unit="kg" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis type="number" dataKey="y" name="Rendement" unit="t" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Parcelles" data={getScatterData()} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Card */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-6 uppercase text-xs tracking-widest">Répartition des Cultures</h3>
            <div className="h-[350px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getCultureDistribution()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {getCultureDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                 <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totalCollectes}</p>
                 <p className="text-[10px] text-slate-400">TOTAL</p>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="col-span-12 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 overflow-hidden flex flex-col min-h-[400px]">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
               <span className="material-symbols-outlined text-emerald-500">map</span> Vue Géospatiale des Exploitations
            </h3>
            <div className="flex-grow relative z-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <MapContainer center={[4, 12]} zoom={6} style={{ height: '400px', width: '100%' }}>
                <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                {collectes.filter(c => c.latitude && c.longitude).map(c => (
                  <Marker key={c.id_collecte} position={[c.latitude, c.longitude]}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-emerald-800">{c.culture_type}</p>
                        <p className="text-[10px] text-slate-500">{c.plantation_name || c.nom_lieu}</p>
                        <p className="text-xs font-bold mt-1">{c.rendement_final} T/HA</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="col-span-12 bg-white dark:bg-slate-900 rounded-[16px] p-8 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                 <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Interprétation AgroAnalytics AI</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="space-y-4">
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-body-md">
                   {stats?.matrice_correlation?.quantite_engrais?.rendement_final !== undefined ? (
                     <>
                       L'analyse croisée des données révèle une corrélation de <span className="font-bold text-emerald-500">{(stats.matrice_correlation.quantite_engrais.rendement_final).toFixed(2)}</span> entre la fertilisation et le rendement. 
                       {stats.matrice_correlation.quantite_engrais.rendement_final > 0.8 ? 
                         " Ce score exceptionnel démontre que vos rendements sont quasi-exclusivement pilotés par la précision de vos intrants." : 
                         stats.matrice_correlation.quantite_engrais.rendement_final > 0.5 ? 
                         " Cela indique une dépendance positive forte : chaque kilo d'engrais supplémentaire contribue significativement à la récolte." : 
                         " La corrélation est modérée, suggérant que des facteurs externes (irrigation, qualité du sol) jouent un rôle tampon important."}
                     </>
                   ) : "Données insuffisantes pour une analyse approfondie."}
                 </p>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">Analyse Descriptive</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">Régression Linéaire</span>
                 </div>
               </div>
               <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Action Recommandée</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stats?.matrice_correlation?.quantite_engrais?.rendement_final > 0.7 
                        ? "Optimisez vos coûts en testant des micro-doses ciblées sur les parcelles à faible rendement."
                        : "Concentrez-vous sur l'amélioration de l'irrigation pour débloquer le potentiel des engrais."}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
    </div>
  );
}
