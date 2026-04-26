import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = import.meta.env.VITE_API_URL || 'https://keubou-fotsa-willy-24f2657.onrender.com/api';
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
    try {
      setLoading(true);
      setError(null);
      const [statsRes, collectesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/`),
        axios.get(`${API_BASE}/collectes/?skip=0&limit=1000`)
      ]);
      setStats(statsRes.data || {});
      setCollectes(collectesRes.data || []);
    } catch (err) {
      console.error('Erreur API:', err);
      setError("Impossible de récupérer les analyses. Le serveur est peut-être en train de redémarrer (patientez 30s).");
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
      pdf.save(`Rapport_Analytique_AgroAnalytics_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
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
           <div className="text-emerald-900 dark:text-emerald-100 font-bold animate-pulse text-sm uppercase tracking-widest">Récupération des données en cours...</div>
        </div>
      </div>
    );
  }

  if (error && collectes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100">
           <span className="material-symbols-outlined text-4xl text-red-500">cloud_off</span>
           <p className="font-bold text-red-800 dark:text-red-300">{error}</p>
           <button onClick={fetchData} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Réessayer</button>
        </div>
      </div>
    );
  }

  // Calculate Global Stats
  const totalCollectes = collectes.length;
  const sg = stats?.stats_globales || {};
  
  const avgYield = sg.mean !== undefined && sg.mean !== null ? sg.mean : (totalCollectes > 0 ? (collectes.reduce((sum, c) => sum + c.rendement_final, 0) / totalCollectes) : 0);
  const avgVariance = sg.variance !== undefined && sg.variance !== null ? sg.variance : 'N/A';
  const avgStdDev = sg.std_dev !== undefined && sg.std_dev !== null ? sg.std_dev : 'N/A';
  const standardError = sg.standard_error !== undefined && sg.standard_error !== null ? sg.standard_error : 'N/A';

  const correlationVal = stats?.matrice_correlation?.quantite_engrais?.rendement_final ?? 0;
  const confidenceIndex = (Math.abs(correlationVal) * 100 * Math.min(totalCollectes / 10, 1)).toFixed(1);
  const rSquared = (correlationVal ** 2).toFixed(4);

  const lastUpdate = collectes.length > 0 
    ? new Date(Math.max(...collectes.map(c => new Date(c.updated_at || c.created_at)))).toLocaleString('fr-FR')
    : 'N/A';

  // Metrics for the PDF Report
  const yields = collectes.map(c => c.rendement_final);
  const minYield = yields.length > 0 ? Math.min(...yields).toFixed(2) : '0.00';
  const maxYield = yields.length > 0 ? Math.max(...yields).toFixed(2) : '0.00';
  const totalEngrais = collectes.reduce((sum, c) => sum + (c.quantite_engrais || 0), 0).toFixed(0);
  const totalSurface = collectes.reduce((sum, c) => sum + (c.surface || 0), 0).toFixed(2);

  return (
    <div className="w-full">
        {/* REPORT TEMPLATE (Hidden from UI, used for PDF generation) */}
        <div ref={reportRef} style={{ display: 'none', width: '900px', padding: '0', backgroundColor: 'white', color: '#1e293b', fontFamily: 'sans-serif' }}>
          
          {/* Header Section */}
          <div style={{ backgroundColor: '#064e3b', padding: '40px 50px', color: 'white', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div>
                <p style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', margin: '0 0 10px 0' }}>AGROANALYTICS PREMIER</p>
                <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>RAPPORT DE<br/>PERFORMANCE</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold', fontSize: '20px', margin: 0 }}>AgroAnalytics</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Intelligence de Précision</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Généré le</p>
                <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Unité de contrôle</p>
                <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>AI Engine v2.4</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Confidentialité</p>
                <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Strictement Confidentiel</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px 50px' }}>
            {/* KPI Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              <div style={{ flex: '1', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Performance Globale</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>Coefficient d'efficacité (R²)</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#065f46' }}>{rSquared}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>Stabilité des rendements</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#065f46' }}>{confidenceIndex}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>Volume de données traité</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#065f46' }}>{totalCollectes} parcelles</span>
                </div>
              </div>
              
              <div style={{ flex: '1.2', padding: '25px', backgroundColor: '#064e3b', borderRadius: '16px', color: 'white' }}>
                <h3 style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Verdict du moteur AI</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {correlationVal > 0.7 
                    ? "Excellente corrélation détectée. La stratégie de fertilisation actuelle est très efficace et se traduit directement par des gains de rendement." 
                    : "Corrélation modérée. Le facteur limitant n'est pas l'engrais seul. Examinez la qualité du drainage ou les micro-nutriments du sol."}
                </p>
              </div>
            </div>

            {/* Advanced Stats Table */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#065f46', borderBottom: '2px solid #065f46', paddingBottom: '10px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                Tableau des Métriques Statistiques Avancées
              </h2>
              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>Calculées sur {totalCollectes} parcelle(s) • {totalSurface} ha de surface totale analysée</p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {/* Section 1 */}
                  <tr>
                    <td colSpan="3" style={{ padding: '15px 10px 10px 10px', fontWeight: 'bold', color: '#334155', backgroundColor: '#f8fafc' }}>1. STATISTIQUES DESCRIPTIVES DES RENDEMENTS</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', color: '#64748b', width: '35%', fontSize: '10px', textTransform: 'uppercase' }}>Indicateur</td>
                    <td style={{ padding: '10px', color: '#64748b', width: '25%', fontSize: '10px', textTransform: 'uppercase' }}>Valeur</td>
                    <td style={{ padding: '10px', color: '#64748b', width: '40%', fontSize: '10px', textTransform: 'uppercase' }}>Interprétation</td>
                  </tr>
                  {[
                    { label: 'Rendement Moyen (μ)', val: `${avgYield.toFixed(2)} t/ha`, interp: 'Performance moyenne de l\'ensemble des parcelles', color: '#059669' },
                    { label: 'Rendement Minimum', val: `${minYield} t/ha`, interp: 'Parcelle la moins productive', color: '#dc2626' },
                    { label: 'Rendement Maximum', val: `${maxYield} t/ha`, interp: 'Parcelle la plus productive', color: '#059669' },
                    { label: 'Variance (σ²)', val: avgVariance, interp: avgVariance !== 'N/A' && parseFloat(avgVariance) < 1 ? 'Faible dispersion — Production homogène' : avgVariance !== 'N/A' ? 'Forte dispersion — Hétérogénéité entre parcelles' : 'Données insuffisantes', color: avgVariance !== 'N/A' && parseFloat(avgVariance) < 1 ? '#059669' : '#d97706' },
                    { label: 'Écart-Type (σ)', val: avgStdDev !== 'N/A' ? `${avgStdDev} t/ha` : 'N/A', interp: avgStdDev !== 'N/A' ? `Marge de variation de ±${avgStdDev} t/ha autour de la moyenne` : 'Données insuffisantes (n<2)', color: '#0f172a' },
                    { label: 'Erreur Standard (SE)', val: standardError, interp: 'Précision de l\'estimation de la moyenne (σ/√n)', color: '#0f172a' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#1e293b' }}>{row.label}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: row.color }}>{row.val}</td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.interp}</td>
                    </tr>
                  ))}

                  {/* Section 2 */}
                  <tr>
                    <td colSpan="3" style={{ padding: '25px 10px 10px 10px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>2. ANALYSE DE CORRÉLATION & RÉGRESSION</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Indicateur</td>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Valeur</td>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Interprétation</td>
                  </tr>
                  {[
                    { label: 'Coefficient de Pearson (R)', val: correlationVal.toFixed(4), interp: correlationVal > 0.7 ? 'Forte corrélation linéaire' : 'Corrélation faible - D\'autres facteurs dominent', color: correlationVal > 0.7 ? '#059669' : '#dc2626' },
                    { label: 'Coefficient de Détermination (R²)', val: rSquared, interp: `${(rSquared * 100).toFixed(1)}% de la variation du rendement est expliquée par l'engrais`, color: '#0f172a' },
                    { label: 'Indice de Confiance', val: `${confidenceIndex}%`, interp: 'Niveau de fiabilité statistique du modèle', color: '#0f172a' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#1e293b' }}>{row.label}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: row.color }}>{row.val}</td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.interp}</td>
                    </tr>
                  ))}

                  {/* Section 3 */}
                  <tr>
                    <td colSpan="3" style={{ padding: '25px 10px 10px 10px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}>3. EFFICIENCE DES INTRANTS</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Indicateur</td>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Valeur</td>
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Interprétation</td>
                  </tr>
                  {[
                    { label: 'Engrais Total Utilisé', val: `${totalEngrais} kg`, interp: 'Ensemble des intrants enregistrés', color: '#0f172a' },
                    { label: 'Surface Totale Couverte', val: `${totalSurface} ha`, interp: 'Superficie totale de toutes les parcelles', color: '#0f172a' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#1e293b' }}>{row.label}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: row.color }}>{row.val}</td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{row.interp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '10px' }}>
              Document généré de façon automatisée et sécurisée • © 2026 AgroAnalytics
            </div>
          </div>
        </div>

        {/* Dashboard Header UI */}
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

        {/* Stats Summary Cards UI */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-3 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 border-l-4 border-primary">
            <p className="font-label-caps text-[10px] text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">RENDEMENT MOYEN</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{avgYield.toFixed(2)}</span>
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

          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-[16px] p-6 shadow-sm border border-emerald-900/5 dark:border-emerald-100/10">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 uppercase text-xs tracking-widest">Répartition des Cultures</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getCultureDistribution()} cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="#fff" strokeWidth={2} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {getCultureDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} parcelle(s)`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {getCultureDistribution().map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totalCollectes}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total parcelles</p>
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
