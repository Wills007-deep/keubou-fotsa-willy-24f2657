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
  const [isExporting, setIsExporting] = useState(false);
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
    setIsExporting(true);
    try {
      const reportElement = reportRef.current;
      
      // On prépare l'élément pour la capture (visible mais hors champ)
      reportElement.style.display = 'block';
      reportElement.style.position = 'fixed';
      reportElement.style.left = '-10000px';
      reportElement.style.top = '0';
      
      // On laisse beaucoup de temps aux graphiques pour s'animer et s'afficher
      await new Promise(resolve => setTimeout(resolve, 2500));

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        windowWidth: 1000
      });
      
      reportElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      pdf.save(`Rapport_Analytique_AgroAnalytics_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Erreur lors de la génération. Assurez-vous que la page est bien chargée.");
    } finally {
      setIsExporting(false);
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
  const yields = collectes.map(c => c.rendement_final).filter(v => v != null);
  const avgYield = yields.length > 0
    ? (yields.reduce((s, v) => s + v, 0) / yields.length).toFixed(2)
    : 0;
  const minYield = yields.length > 0 ? Math.min(...yields).toFixed(2) : 0;
  const maxYield = yields.length > 0 ? Math.max(...yields).toFixed(2) : 0;

  const correlationVal = stats?.matrice_correlation?.quantite_engrais?.rendement_final ?? 0;
  const rSquared = (correlationVal ** 2).toFixed(4);
  const confidenceIndex = (Math.abs(correlationVal) * 100 * Math.min(totalCollectes / 10, 1)).toFixed(1);

  const avgVariance = stats?.moyennes_rendement_par_culture?.length > 0
    ? (stats.moyennes_rendement_par_culture.reduce((sum, c) => sum + (c.rendement_ecart_type ** 2), 0) / stats.moyennes_rendement_par_culture.length).toFixed(2)
    : 0;
  const avgStdDev = Math.sqrt(parseFloat(avgVariance)).toFixed(2);
  // Erreur standard = σ / √n
  const standardError = totalCollectes > 0
    ? (parseFloat(avgStdDev) / Math.sqrt(totalCollectes)).toFixed(4)
    : 0;

  const totalSurface = collectes.reduce((s, c) => s + (c.surface || 0), 0).toFixed(2);
  const totalEngrais = collectes.reduce((s, c) => s + (c.quantite_engrais || 0), 0);
  const efficienceEngrais = totalEngrais > 0
    ? ((parseFloat(avgYield) * totalCollectes) / totalEngrais * 1000).toFixed(2)
    : 0; // kg de rendement par kg d'engrais * 1000

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

           {/* Master Report Template - Professional Edition */}
           <div style={{ padding: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                   <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: '0 0 20px 0', textTransform: 'uppercase' }}>Performance Globale</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: '13px', color: '#475569' }}>Coefficient d'efficacité (R²)</span>
                         <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669' }}>{correlationVal.toFixed(3)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: '13px', color: '#475569' }}>Stabilité des rendements</span>
                         <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669' }}>{(100 - parseFloat(avgStdDev) * 10).toFixed(1)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: '13px', color: '#475569' }}>Volume de données traité</span>
                         <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{totalCollectes} parcelles</span>
                      </div>
                   </div>
                </div>
                
                <div style={{ backgroundColor: '#064e3b', padding: '30px', borderRadius: '24px', color: 'white' }}>
                   <h4 style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.7, margin: '0 0 15px 0', textTransform: 'uppercase' }}>Verdict du Moteur AI</h4>
                   <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {correlationVal > 0.6 
                        ? "Système à haute performance. La fertilisation est le levier principal. Potentiel d'optimisation par réduction des doses sur les zones saturées."
                        : "Corrélation modérée. Le facteur limitant n'est pas l'engrais seul. Examinez la qualité du drainage ou les micro-nutriments du sol."}
                   </p>
                </div>
              </div>

              {/* Advanced Statistical Metrics Table */}
              <div style={{ marginBottom: '40px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                 <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#064e3b', marginBottom: '5px', paddingBottom: '10px', borderBottom: '2px solid #064e3b' }}>
                    TABLEAU DES MÉTRIQUES STATISTIQUES AVANCÉES
                 </h3>
                 <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '20px', marginTop: '5px' }}>
                   Calculées sur {totalCollectes} parcelle(s) • {totalSurface} ha de surface totale analysée
                 </p>

                 {/* Section 1: Statistiques Descriptives */}
                 <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   1. Statistiques Descriptives des Rendements
                 </p>
                 <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
                   <thead>
                     <tr style={{ backgroundColor: '#f1f5f9' }}>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INDICATEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '10px', color: '#64748b' }}>VALEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INTERPRÉTATION</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[
                       { label: 'Rendement Moyen (μ)', val: `${avgYield} t/ha`, interp: 'Performance moyenne de l\'ensemble des parcelles', color: '#059669' },
                       { label: 'Rendement Minimum', val: `${minYield} t/ha`, interp: 'Parcelle la moins productive', color: '#dc2626' },
                       { label: 'Rendement Maximum', val: `${maxYield} t/ha`, interp: 'Parcelle la plus productive', color: '#059669' },
                       { label: 'Variance (σ²)', val: avgVariance, interp: parseFloat(avgVariance) < 1 ? 'Faible dispersion — Production homogène' : 'Forte dispersion — Hétérogénéité entre parcelles', color: parseFloat(avgVariance) < 1 ? '#059669' : '#d97706' },
                       { label: 'Écart-Type (σ)', val: `${avgStdDev} t/ha`, interp: `Marge de variation de ±${avgStdDev} t/ha autour de la moyenne`, color: '#0f172a' },
                       { label: 'Erreur Standard (SE)', val: standardError, interp: 'Précision de l\'estimation de la moyenne', color: '#0f172a' },
                     ].map((row, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                         <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{row.label}</td>
                         <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '900', color: row.color, textAlign: 'right' }}>{row.val}</td>
                         <td style={{ padding: '10px 12px', fontSize: '11px', color: '#64748b' }}>{row.interp}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>

                 {/* Section 2: Analyse de Corrélation */}
                 <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   2. Analyse de Corrélation &amp; Régression
                 </p>
                 <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
                   <thead>
                     <tr style={{ backgroundColor: '#f1f5f9' }}>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INDICATEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '10px', color: '#64748b' }}>VALEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INTERPRÉTATION</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[
                       { label: 'Coefficient de Pearson (R)', val: correlationVal.toFixed(4), interp: correlationVal > 0.7 ? 'Corrélation forte — L\'engrais influence fortement le rendement' : correlationVal > 0.4 ? 'Corrélation modérée — Influence partielle de l\'engrais' : 'Corrélation faible — D\'autres facteurs dominent', color: correlationVal > 0.7 ? '#059669' : correlationVal > 0.4 ? '#d97706' : '#dc2626' },
                       { label: 'Coefficient de Détermination (R²)', val: rSquared, interp: `${(parseFloat(rSquared) * 100).toFixed(1)}% de la variation du rendement est expliquée par l\'engrais`, color: '#059669' },
                       { label: 'Indice de Confiance', val: `${confidenceIndex}%`, interp: 'Niveau de fiabilité statistique du modèle', color: '#059669' },
                     ].map((row, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                         <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{row.label}</td>
                         <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '900', color: row.color, textAlign: 'right' }}>{row.val}</td>
                         <td style={{ padding: '10px 12px', fontSize: '11px', color: '#64748b' }}>{row.interp}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>

                 {/* Section 3: Efficience des Intrants */}
                 <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   3. Efficience des Intrants
                 </p>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ backgroundColor: '#f1f5f9' }}>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INDICATEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '10px', color: '#64748b' }}>VALEUR</th>
                       <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', color: '#64748b' }}>INTERPRÉTATION</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[
                       { label: 'Engrais Total Utilisé', val: `${totalEngrais} kg`, interp: 'Ensemble des intrants enregistrés', color: '#0f172a' },
                       { label: 'Surface Totale Couverte', val: `${totalSurface} ha`, interp: 'Superficie totale de toutes les parcelles', color: '#0f172a' },
                       { label: 'Efficience Engrais (Ratio)', val: efficienceEngrais, interp: 'Indice de productivité par kg d\'engrais utilisé (plus = mieux)', color: parseFloat(efficienceEngrais) > 1 ? '#059669' : '#d97706' },
                     ].map((row, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                         <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{row.label}</td>
                         <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '900', color: row.color, textAlign: 'right' }}>{row.val}</td>
                         <td style={{ padding: '10px 12px', fontSize: '11px', color: '#64748b' }}>{row.interp}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>

                 <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '15px', fontStyle: 'italic' }}>
                    * Toutes les métriques sont calculées en temps réel sur vos données collectées sur le terrain. Source : AgroAnalytics AI Engine v2.4
                 </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                 <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f5238', marginBottom: '15px' }}>NUAGE DE POINTS : EFFICIENCE DES INTRANTS</p>
                    <ScatterChart width={420} height={250}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                       <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                       <Scatter data={getScatterData()} fill="#10b981" />
                    </ScatterChart>
                 </div>
                 <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f5238', marginBottom: '15px' }}>RÉPARTITION PAR TYPE DE CULTURE</p>
                    <PieChart width={420} height={250}>
                       <Pie data={getCultureDistribution()} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="none">
                          {getCultureDistribution().map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                    </PieChart>
                 </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '24px', marginBottom: '40px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#064e3b', marginBottom: '20px' }}>ANALYSE COMPARATIVE DES RENDEMENTS</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    {stats?.moyennes_rendement_par_culture?.map((m, i) => (
                      <div key={i} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                         <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>{m.culture_type}</p>
                         <p style={{ fontSize: '18px', fontWeight: '900', color: '#064e3b', margin: 0 }}>{m.rendement_moyen.toFixed(2)} <span style={{ fontSize: '10px', opacity: 0.5 }}>T/HA</span></p>
                         <p style={{ fontSize: '10px', color: m.rendement_ecart_type < 1 ? '#059669' : '#b91c1c' }}>
                            {m.rendement_ecart_type < 1 ? '• Stabilité Haute' : '• Forte Variabilité'}
                         </p>
                      </div>
                    ))}
                 </div>
              </div>

              <div style={{ pageBreakBefore: 'always' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#064e3b', marginBottom: '20px' }}>REGISTRE COMPLET DES DONNÉES DE TERRAIN</h3>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                       <tr style={{ backgroundColor: '#064e3b', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>DATE</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>PARTICIPANT</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>PLANTATION</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>CULTURE</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>SURFACE</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>ENGRAIS (KG)</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>RENDEMENT (T)</th>
                       </tr>
                    </thead>
                    <tbody>
                       {collectes.map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                             <td style={{ padding: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                             <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.participant_name || '-'}</td>
                             <td style={{ padding: '10px' }}>{c.plantation_name || '-'}</td>
                             <td style={{ padding: '10px' }}>{c.culture_type}</td>
                             <td style={{ padding: '10px', textAlign: 'right' }}>{c.surface}</td>
                             <td style={{ padding: '10px', textAlign: 'right' }}>{c.quantite_engrais}</td>
                             <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{c.rendement_final}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div style={{ marginTop: '50px', borderTop: '2px solid #064e3b', paddingTop: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '10px' }}>
                 <p style={{ margin: '0 0 5px 0' }}>Ce document constitue une preuve analytique officielle générée par AgroAnalytics Pro.</p>
                 <p style={{ fontWeight: 'bold', color: '#064e3b' }}>© 2026 AgroAnalytics Cameroon • Rapport Certifié AI</p>
              </div>
           </div>
        </div>


        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="font-h1 text-h1 text-emerald-900 dark:text-emerald-100 mb-2">Centre Analytique</h1>
            <p className="font-body-md text-slate-500 dark:text-slate-400 max-w-xl italic">
              "L'intelligence de précision au service de la productivité agricole camerounaise."
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={exportPDF} 
               disabled={isExporting}
               className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/10"
             >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    GÉNÉRATION...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">analytics</span>
                    TÉLÉCHARGER LE RAPPORT COMPLET (PDF)
                  </>
                )}
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
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
