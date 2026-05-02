import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../api.js';
import axios from 'axios';
import ConnectionStatus from './ui/ConnectionStatus';
import { getRegionFromLocation } from '../utils/locationMapping';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapRecenter({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapClick({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

import { useTheme } from '../context/ThemeContext';

export default function FormulaireCollecte() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { id: collecteId } = useParams();
  const [isEdit, setIsEdit] = useState(!!collecteId);
  
  const [formData, setFormData] = useState({
    culture_type: '',
    custom_culture: '',
    plantation_name: '',
    participant_name: '',
    surface: '',
    quantite_engrais: '',
    volume_eau: '',
    rendement_final: '',
    date_recolte: '',
    region: '',
    soil_type: '',
    nom_lieu: '',
    latitude: 3.848, // Default to Yaoundé region
    longitude: 11.502,
  });

  const [mapCenter, setMapCenter] = useState([3.848, 11.502]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentCollectes, setRecentCollectes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cropOptions] = useState(['Maïs', 'Riz', 'Manioc', 'Cacao', 'Banane', 'Café', 'Palmier à huile', 'Hévéa', 'Autre']);
  const [soilOptions] = useState(['Inconnu', 'Argileux', 'Sablonneux', 'Limoneux', 'Ferralitique', 'Volcanique', 'Humifère']);
  const [regionOptions] = useState(['Centre', 'Littoral', 'Ouest', 'Nord', 'Sud', 'Est', 'Adamaoua', 'Extrême-Nord', 'Nord-Ouest', 'Sud-Ouest']);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await apiClient.get('/collectes/?limit=5');
      const data = Array.isArray(res.data) ? res.data : [];
      setRecentCollectes(data);
    } catch (e) { 
      console.error(e); 
      setRecentCollectes([]);
    }
  }, []);

  const loadCollecte = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/collectes/${collecteId}`);
      const collecte = response.data;
      
      if (!collecte) throw new Error("Données de collecte introuvables");

      const isCustom = !cropOptions.includes(collecte.culture_type);
      setFormData({
        culture_type: isCustom ? 'Autre' : (collecte.culture_type || ''),
        custom_culture: isCustom ? (collecte.culture_type || '') : '',
        plantation_name: collecte.plantation_name || '',
        participant_name: collecte.participant_name || collecte.operator || '',
        surface: collecte.surface || '',
        quantite_engrais: collecte.quantite_engrais || '',
        volume_eau: collecte.volume_eau || '',
        rendement_final: collecte.rendement_final || '',
        date_recolte: collecte.date_recolte ? new Date(collecte.date_recolte).toISOString().split('T')[0] : '',
        region: collecte.region || '',
        soil_type: collecte.soil_type || '',
        nom_lieu: collecte.nom_lieu || '',
        latitude: collecte.latitude || 3.848,
        longitude: collecte.longitude || 11.502,
      });
      if (collecte.latitude && collecte.longitude) {
        setMapCenter([collecte.latitude, collecte.longitude]);
        setSelectedLocation([collecte.latitude, collecte.longitude]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors(prev => ({ ...prev, load: 'Impossible de charger les données de cette collecte.' }));
    } finally {
      setLoading(false);
    }
  }, [collecteId, cropOptions]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecent();
    if (isEdit && collecteId) {
      loadCollecte();
    } else {
      getCurrentLocation();
    }
  }, [collecteId, isEdit, fetchRecent, loadCollecte]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setSelectedLocation([latitude, longitude]);
      }, (err) => {
        console.warn("Geolocation blocked or failed", err);
      });
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setSelectedLocation([lat, lng]);
  };

  const handleSearchLocation = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const placeName = display_name.split(',')[0];
        
        // Auto-detect region from location
        const detectedRegion = getRegionFromLocation(placeName) || getRegionFromLocation(display_name);
        
        setMapCenter([latitude, longitude]);
        setFormData(prev => ({ 
          ...prev, 
          latitude, 
          longitude, 
          nom_lieu: prev.nom_lieu || placeName,
          region: detectedRegion || prev.region // Auto-populate region if detected
        }));
        setSelectedLocation([latitude, longitude]);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.region) newErrors.region = 'La région est obligatoire pour l\'analyse';
    if (!formData.culture_type) newErrors.culture_type = 'Sélectionner une culture';
    if (formData.culture_type === 'Autre' && !formData.custom_culture) newErrors.custom_culture = 'Préciser la culture';
    if (!formData.surface || parseFloat(formData.surface) <= 0) newErrors.surface = 'Surface requise (> 0)';
    if (!formData.quantite_engrais || parseFloat(formData.quantite_engrais) < 0) newErrors.quantite_engrais = 'Quantité requise (>= 0)';
    if (!formData.rendement_final || parseFloat(formData.rendement_final) < 0) newErrors.rendement_final = 'Rendement requis (>= 0)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error message
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        culture_type: formData.culture_type === 'Autre' ? formData.custom_culture : formData.culture_type,
        surface: parseFloat(formData.surface),
        quantite_engrais: parseFloat(formData.quantite_engrais),
        rendement_final: parseFloat(formData.rendement_final),
        volume_eau: formData.volume_eau ? parseFloat(formData.volume_eau) : null,
        date_recolte: formData.date_recolte ? new Date(formData.date_recolte).toISOString() : null,
      };
      delete payload.custom_culture;

      if (isEdit) {
        await apiClient.put(`/collectes/${collecteId}`, payload);
      } else {
        await apiClient.post('/collectes/', payload);
      }
      navigate('/collectes');
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Vérifiez les champs.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <section className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="font-h2 text-h2 text-emerald-900 mb-2">{isEdit ? 'Modifier la Collecte' : 'Nouvelle Collecte AgroAnalytics'}</h2>
          <p className="font-body-md text-slate-500 max-w-2xl">Capturez les données de précision pour améliorer vos futurs rendements.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <ConnectionStatus onRetry={isEdit ? loadCollecte : fetchRecent} compact />
            
            
            {/* Step 1: GEOLOCATION AT THE TOP */}
            <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-emerald-900/5">
              <div className="p-6 bg-emerald-50 border-b border-emerald-900/5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                  <div>
                    <h3 className="font-h3 text-lg text-emerald-900">Localisation Géographique</h3>
                    <p className="text-xs text-emerald-700 font-bold mt-1">Étape prioritaire : Veuillez commencer par rechercher ou pointer votre position précise sur la carte.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                      placeholder="Rechercher une ville, un village..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Rechercher
                  </button>
                  <button 
                    type="button" 
                    onClick={getCurrentLocation} 
                    title="Ma position actuelle" 
                    className="bg-white border border-slate-200 text-primary hover:bg-emerald-50 px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
                  >
                     <span className="material-symbols-outlined">my_location</span>
                  </button>
                </div>
              </div>
              
              <div className="h-[350px] relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                  <MapClick onLocationSelect={handleLocationSelect} />
                  <MapRecenter center={mapCenter} />
                  {selectedLocation && <Marker position={selectedLocation} />}
                </MapContainer>
                {selectedLocation && (
                  <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-xl text-xs font-mono shadow-lg border border-slate-200 z-[400] text-slate-700">
                    <span className="font-bold text-emerald-800">Coordonnées : </span>
                    {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-6">
                  <div className="space-y-sm">
                    <label className={`font-label-caps text-label-caps ${errors.region ? 'text-red-500' : 'text-slate-400'} uppercase tracking-widest`}>Région Détectée / Sélectionnée *</label>
                    <select name="region" value={formData.region} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border ${errors.region ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} font-body-md bg-white`}>
                      <option value="">Sélectionner Région</option>
                      {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.region && <p className="text-red-500 text-[10px] font-bold italic">{errors.region}</p>}
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest">Type de Sol (Optionnel)</label>
                    <select name="soil_type" value={formData.soil_type} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-body-md bg-white">
                      <option value="">Sélectionner Sol</option>
                      {soilOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-slate-400">LIEU PRÉCIS / PARCELLE</label>
                  <input name="nom_lieu" value={formData.nom_lieu} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-body-md" placeholder="Ex: Bloc Sud 4-B (Optionnel si région trouvée)" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-[16px] p-8 shadow-sm border border-emerald-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="font-h3 text-h3 text-emerald-900">Culture & Plantation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-6">
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-slate-400">NOM PLANTATION</label>
                  <input name="plantation_name" value={formData.plantation_name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-body-md" placeholder="Ex. Ferme de Njombé" />
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-slate-400">NOM DU PARTICIPANT</label>
                  <input name="participant_name" value={formData.participant_name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-body-md" placeholder="Ex. Jean Dupont" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.culture_type ? 'text-red-500' : 'text-slate-400'}`}>TYPE DE CULTURE *</label>
                  <select name="culture_type" value={formData.culture_type} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border ${errors.culture_type ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md bg-white`}>
                    <option value="">Choisir...</option>
                    {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.culture_type && <p className="text-red-500 text-[10px] font-bold italic">{errors.culture_type}</p>}
                </div>
                {formData.culture_type === 'Autre' && (
                  <div className="space-y-sm">
                    <label className={`font-label-caps text-label-caps ${errors.custom_culture ? 'text-red-500' : 'text-slate-400'}`}>PRÉCISER CULTURE *</label>
                    <input name="custom_culture" value={formData.custom_culture} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border ${errors.custom_culture ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md`} placeholder="Ex. Poivre de Penja" />
                    {errors.custom_culture && <p className="text-red-500 text-[10px] font-bold italic">{errors.custom_culture}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Variables */}
            <div className="bg-white rounded-[16px] p-8 shadow-sm border border-emerald-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="font-h3 text-h3 text-emerald-900">Variables de Contrôle & Récolte</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-8">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-xs ${errors.surface ? 'text-red-500' : 'text-slate-400'}`}>SURFACE (HA) *</label>
                  <input name="surface" value={formData.surface} onChange={handleInputChange} type="number" step="0.1" className={`w-full px-4 py-3 rounded-xl border ${errors.surface ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} font-body-md`} />
                  {errors.surface && <p className="text-red-500 text-[10px] font-bold italic">{errors.surface}</p>}
                </div>
                <div className="space-y-sm">
                  <label className={`font-label-caps text-xs ${errors.quantite_engrais ? 'text-red-500' : 'text-slate-400'}`}>ENGRAIS (KG) *</label>
                  <input name="quantite_engrais" value={formData.quantite_engrais} onChange={handleInputChange} type="number" className={`w-full px-4 py-3 rounded-xl border ${errors.quantite_engrais ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} font-body-md`} />
                  {errors.quantite_engrais && <p className="text-red-500 text-[10px] font-bold italic">{errors.quantite_engrais}</p>}
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-xs text-slate-400">EAU (m³) - OPTIONNEL</label>
                  <input name="volume_eau" value={formData.volume_eau} onChange={handleInputChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 font-body-md" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.rendement_final ? 'text-red-500' : 'text-primary'} font-bold`}>RENDEMENT FINAL (TONS) *</label>
                  <input name="rendement_final" value={formData.rendement_final} onChange={handleInputChange} type="number" className={`w-full px-4 py-4 rounded-xl border-2 ${errors.rendement_final ? 'border-red-500 bg-red-50/30' : 'border-primary/20 bg-emerald-50/30'} text-xl font-bold text-primary`} />
                  {errors.rendement_final && <p className="text-red-500 text-[10px] font-bold italic">{errors.rendement_final}</p>}
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-slate-400">DATE RÉCOLTE</label>
                  <input name="date_recolte" value={formData.date_recolte} onChange={handleInputChange} type="date" className="w-full px-4 py-4 rounded-xl border border-slate-200 font-body-md" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-md pt-4">
              <button type="button" onClick={() => navigate('/collectes')} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 order-2 sm:order-1">Annuler</button>
              <button type="submit" disabled={loading} className="bg-primary text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 order-1 sm:order-2">
                {loading ? 'Enregistrement...' : 'Valider la Collecte'}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-emerald-900/5 sticky top-24">
              <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">history</span> Soumissions Récentes
              </h4>
              <div className="space-y-3">
                {recentCollectes.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => navigate(`/formulaire/${c.id_collecte}`)}>
                    <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-sm">eco</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{c.plantation_name || c.culture_type}</p>
                      <p className="text-[9px] text-slate-400">{c.rendement_final} T • {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {recentCollectes.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Aucune donnée récente</p>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
