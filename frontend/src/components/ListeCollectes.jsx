import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function ListeCollectes() {
  const navigate = useNavigate();
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCulture, setFilterCulture] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 4;

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
      'Maïs': 'grass',
      'Riz': 'grain',
      'Cacao': 'bakery_dining',
      'Manioc': 'potted_plant',
      'Blé': 'grain',
      'Soja': 'leaf',
    };
    return icons[culture] || 'grass';
  };

  const uniqueCultures = ['Tous', ...new Set(collectes.map(c => c.culture_type))];

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-secondary-fixed-variant mb-1">Historique des Collectes</h1>
              <p className="font-body-md text-on-surface-variant">Projet INF 232 • Suivi de toutes vos collectes de terrain</p>
            </div>
            <button 
              onClick={() => navigate('/formulaire')}
              className="bg-primary hover:bg-primary-container text-on-primary font-bold px-6 py-3 rounded-[16px] shadow-[0px_4px_20px_rgba(27,67,50,0.15)] flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Nouvelle Collecte
            </button>
          </div>

          {/* Summary Cards */}
          <section className="grid grid-cols-12 gap-gutter mb-lg">
            <div className="col-span-12 md:col-span-4 bg-white p-lg rounded-[16px] shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex items-center gap-lg border border-emerald-900/5">
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <div>
                <p className="text-label-caps text-outline uppercase">Total Collectes</p>
                <p className="text-h2 font-h2 text-on-surface">{collectes.length}</p>
                <p className="text-xs text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +12% ce mois
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 bg-white p-lg rounded-[16px] shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex items-center gap-lg border border-emerald-900/5">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-4xl">agriculture</span>
              </div>
              <div>
                <p className="text-label-caps text-outline uppercase">Rendement Moyen</p>
                <p className="text-h2 font-h2 text-on-surface">
                  {collectes.length > 0 
                    ? (collectes.reduce((a, c) => a + c.rendement_final, 0) / collectes.length).toFixed(2)
                    : '0'} <span className="text-body-md font-normal">T/ha</span>
                </p>
                <p className="text-xs text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">equalizer</span> Stable
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 bg-primary-container p-lg rounded-[16px] shadow-[0px_10px_30px_rgba(27,67,50,0.12)] relative overflow-hidden text-white">
              <div className="relative z-10">
                <p className="text-label-caps text-primary-fixed opacity-80 uppercase">Dernière Mise à Jour</p>
                <p className="text-h3 font-h3">Aujourd'hui, 14:30</p>
                <button className="mt-md bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold transition-all">Exporter PDF</button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">analytics</span>
              </div>
            </div>
          </section>

          {/* Filter Section */}
          <section className="mb-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {uniqueCultures.map(culture => (
                <button
                  key={culture}
                  onClick={() => { setFilterCulture(culture); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                    filterCulture === culture
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-secondary hover:bg-secondary-fixed border border-secondary-fixed'
                  }`}
                >
                  {culture}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-semibold border border-outline-variant hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Plus de filtres
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-semibold border border-outline-variant hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                Cette Année
              </button>
            </div>
          </section>

          {/* Table */}
          <section className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(27,67,50,0.08)] overflow-hidden border border-emerald-900/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30">
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider">Culture</th>
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider">Plantation</th>
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider text-center">Date</th>
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider text-right">Rendement</th>
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider text-center">Statut</th>
                    <th className="px-lg py-md text-label-caps text-outline uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {displayedCollectes.map((c, idx) => (
                    <tr key={c.id_collecte} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                            <span className="material-symbols-outlined">{getCultureIcon(c.culture_type)}</span>
                          </div>
                          <span className="font-bold text-emerald-900">{c.culture_type}</span>
                        </div>
                      </td>
                      <td className="px-lg py-lg text-body-md text-on-surface">{c.plantation_name || c.nom_lieu || '-'}</td>
                      <td className="px-lg py-lg text-center text-body-md text-slate-500">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-lg py-lg text-right">
                        <span className="font-bold text-on-surface">{c.rendement_final}</span> <span className="text-xs text-outline">Tons</span>
                      </td>
                      <td className="px-lg py-lg text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                          Validé
                        </span>
                      </td>
                      <td className="px-lg py-lg text-right relative">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/formulaire/${c.id_collecte}`)}
                            className="p-2 hover:bg-emerald-100 rounded-lg text-secondary transition-colors"
                            title="Éditer"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c.id_collecte)}
                            className="p-2 hover:bg-error/20 rounded-lg text-error transition-colors"
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(c.id_collecte)}
                          className="md:hidden p-2 text-secondary hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-lg flex items-center justify-between border-t border-outline-variant/30">
              <span className="text-sm text-outline">
                Affichage de {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCollectes.length)} sur {filteredCollectes.length} collectes
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[16px] p-lg shadow-lg max-w-sm">
              <h3 className="font-h3 text-h3 text-on-surface mb-md">Confirmer la suppression</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Êtes-vous sûr de vouloir supprimer cette collecte ? Cette action ne peut pas être annulée.
              </p>
              <div className="flex gap-md justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 border border-outline-variant rounded-xl font-semibold hover:bg-surface-container transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2 bg-error text-white rounded-xl font-semibold hover:brightness-110 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
