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
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, collectesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/`),
        axios.get(`${API_BASE}/collectes/?skip=0&limit=1000`)
      ]);
      setStats(statsRes.data || {});
      setCollectes(collectesRes.data || []);
    } catch (error) {
      console.error('Erreur API:', error);
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
      reportElement.style.display = 'block';
      
      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      reportElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`Rapport_AgroAnalytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
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
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center">
           <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-emerald-900 dark:text-emerald-100 font-bold animate-pulse text-sm uppercase tracking-widest">Génération des analyses en cours...</div>
           <p className="text-xs text-slate-400 font-mono">Connexion au serveur : {API_BASE}</p>
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
        {/* Hidden Report Template for PDF */}
        <div ref={reportRef} style={{ display: 'none', width: '900px', padding: '50px', backgroundColor: 'white', color: '#1e293b' }}>
           <div style={{ borderBottom: '3px solid #065f46', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ color: '#065f46', fontSize: '32px', fontWeight: '900', margin: 0 }}>RAPPORT DE PERFORMANCE AGRONOMIQUE</h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>AgroAnalytics AI Engine • Rapport Généré le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <p style={{ fontWeight: 'bold', color: '#065f46', margin: 0, fontSize: '18px' }}>AgroAnalytics</p>
                 <p style={{ fontSize: '12px', color: '#94a3b8' }}>Intelligence de Précision</p>
              </div>
           </div>

           {/* Dashboard Summary in Report */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Rendement Moyen</p>
                 <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>{avgYield} t/ha</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Corrélation</p>
                 <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>{correlationVal.toFixed(2)}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Variance</p>
                 <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>{avgVariance}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Écart-type</p>
                 <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>{avgStdDev}</p>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '40px' }}>
              <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', padding: '20px' }}>
                 <h3 style={{ fontSize: '14px', color: '#065f46', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>CORRÉLATION ENGRAIS / RENDEMENT</h3>
                 <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" dataKey="x" name="Engrais" unit="kg" axisLine={false} tickLine={false} />
                        <YAxis type="number" dataKey="y" name="Rendement" unit="t" axisLine={false} tickLine={false} />
                        <Scatter name="Parcelles" data={getScatterData()} fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', padding: '20px' }}>
                 <h3 style={{ fontSize: '14px', color: '#065f46', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>RÉPARTITION DES CULTURES</h3>
                 <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getCultureDistribution()} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {getCultureDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div style={{ marginBottom: '40px', padding: '25px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7' }}>
              <h2 style={{ color: '#166534', fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 Interpretation Analytique
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#374151' }}>
                L'analyse des données révèle une corrélation de <span style={{fontWeight:'bold'}}>{correlationVal.toFixed(2)}</span>. 
                {correlationVal > 0.7 
                  ? "Cette valeur indique que le rendement est fortement dépendant de la fertilisation. L'optimisation des intrants est le levier principal de croissance." 
                  : "La corrélation est modérée, ce qui suggère que d'autres variables (qualité du sol, irrigation) influencent significativement les résultats."}
                La variance de <span style={{fontWeight:'bold'}}>{avgVariance}</span> indique {parseFloat(avgVariance) > 10 ? "une hétérogénéité importante entre les parcelles, nécessitant une approche ciblée." : "une relative homogénéité des rendements sur l'exploitation."}
              </p>
           </div>

           <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '16px', color: '#065f46', marginBottom: '15px', borderLeft: '4px solid #10b981', paddingLeft: '10px' }}>HISTORIQUE COMPLET DES COLLECTES</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                 <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                       <th style={{ textAlign: 'left', padding: '10px' }}>DATE</th>
                       <th style={{ textAlign: 'left', padding: '10px' }}>CULTURE</th>
                       <th style={{ textAlign: 'left', padding: '10px' }}>RÉGION</th>
                       <th style={{ textAlign: 'left', padding: '10px' }}>SOL</th>
                       <th style={{ textAlign: 'right', padding: '10px' }}>SURFACE</th>
                       <th style={{ textAlign: 'right', padding: '10px' }}>ENGRAIS</th>
                       <th style={{ textAlign: 'right', padding: '10px' }}>RENDEMENT</th>
                    </tr>
                 </thead>
                 <tbody>
                    {collectes.map((c, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.culture_type}</td>
                          <td style={{ padding: '10px' }}>{c.region || 'N/A'}</td>
                          <td style={{ padding: '10px' }}>{c.soil_type || 'N/A'}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{c.surface} ha</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{c.quantite_engrais} kg</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>{c.rendement_final} t/ha</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '10px' }}>
              Document confidentiel généré par AgroAnalytics Engine • © 2026 AgroAnalytics
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
