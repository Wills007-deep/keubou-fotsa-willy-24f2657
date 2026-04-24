import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:8000/api';

export default function ListeCollectes() {
  const navigate = useNavigate();
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCulture, setFilterCulture] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const listRef = useRef(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCollectes();
  }, []);

  const fetchCollectes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/collectes/?skip=0&limit=1000`);
      setCollectes(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!listRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(listRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save('AgroAnalytics_Collectes.pdf');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/collectes/${id}`);
      setCollectes(collectes.filter(c => c.id_collecte !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredCollectes = filterCulture === 'Tous' 
    ? collectes 
    : collectes.filter(c => c.culture_type === filterCulture);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCollectes = filteredCollectes.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredCollectes.length / itemsPerPage);

  const getCultureIcon = (culture) => {
    const icons = {
      'Maïs': 'grass', 'Riz': 'grain', 'Cacao': 'bakery_dining', 'Manioc': 'potted_plant', 'Banane': 'restaurant_menu'
    };
    return icons[culture] || 'eco';
  };

  const uniqueCultures = ['Tous', ...new Set(collectes.map(c => c.culture_type))];

  const lastUpdate = collectes.length > 0 
    ? new Date(Math.max(...collectes.map(c => new Date(c.updated_at || c.created_at)))).toLocaleDateString('fr-FR')
    : 'N/A';

  if (loading && collectes.length === 0) return (
    <div className="w-full h-screen flex items-center justify-center dark:bg-slate-950">
       <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full" ref={listRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-emerald-900 dark:text-emerald-100 mb-1">Historique des Collectes</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestion et suivi des parcelles en temps réel</p>
        </div>
        <button onClick={() => navigate('/formulaire')} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span> Nouvelle Collecte
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined">database</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{collectes.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Régions</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{new Set(collectes.map(c => c.region)).size}</p>
          </div>
        </div>
        <div className="bg-emerald-900 dark:bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Dernière Mise à Jour</p>
              <p className="text-lg font-bold">{lastUpdate}</p>
              <button onClick={exportPDF} className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Exporter PDF
              </button>
           </div>
           <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-10">history</span>
        </div>
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-emerald-900/5 dark:border-emerald-100/10 overflow-hidden">
        <div className="p-4 border-b border-emerald-900/5 dark:border-slate-800 flex flex-wrap gap-2">
          {uniqueCultures.slice(0, 8).map(c => (
            <button key={c} onClick={() => setFilterCulture(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterCulture === c ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Culture</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Région</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plantation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Rendement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedCollectes.map(c => (
                <tr key={c.id_collecte} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-sm">{getCultureIcon(c.culture_type)}</span>
                      </div>
                      <span className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{c.culture_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{c.region || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{c.plantation_name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">{c.rendement_final}</span> <span className="text-[10px] text-slate-400">T/HA</span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/formulaire/${c.id_collecte}`)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id_collecte)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Page {currentPage} sur {totalPages || 1}</p>
           <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                 <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                 <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
           </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl max-w-sm w-full border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Confirmer Suppression</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Cette action est irréversible. Voulez-vous continuer ?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 active:scale-95 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
