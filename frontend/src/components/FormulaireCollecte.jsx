import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { getRegionFromLocation } from '../utils/locationMapping';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : 'https://keubou-fotsa-willy-24f2657.onrender.com/api');

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
    participant_name: '',
    culture_type: '',
    custom_culture: '',
    plantation_name: '',
    operator: '',
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

  useEffect(() => {
    fetchRecent();
    if (isEdit && collecteId) {
      loadCollecte();
    } else {
      getCurrentLocation();
    }
  }, [collecteId, isEdit]);

  const fetchRecent = async () => {
    try {
      const res = await axios.get(`${API_BASE}/collectes/?limit=5`);
      setRecentCollectes(res.data);
    } catch (e) { console.error(e); }
  };

  const loadCollecte = async () => {
    try {
      const response = await axios.get(`${API_BASE}/collectes/${collecteId}`);
      const collecte = response.data;
      const isCustom = !cropOptions.includes(collecte.culture_type);
      setFormData({
        participant_name: collecte.participant_name || '',
        culture_type: isCustom ? 'Autre' : collecte.culture_type,
        custom_culture: isCustom ? collecte.culture_type : '',
        plantation_name: collecte.plantation_name || '',
        operator: collecte.operator || '',
        surface: collecte.surface,
        quantite_engrais: collecte.quantite_engrais,
        volume_eau: collecte.volume_eau || '',
        rendement_final: collecte.rendement_final,
        date_recolte: collecte.date_recolte ? new Date(collecte.date_recolte).toISOString().split('T')[0] : '',
        region: collecte.region || '',
        soil_type: collecte.soil_type || '',
        nom_lieu: collecte.nom_lieu || '',
        latitude: collecte.latitude,
        longitude: collecte.longitude,
      });
      if (collecte.latitude && collecte.longitude) {
        setMapCenter([collecte.latitude, collecte.longitude]);
        setSelectedLocation([collecte.latitude, collecte.longitude]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

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
      // On ajoute countrycodes=cm pour forcer la recherche au Cameroun
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=cm&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        // On centre la carte et on place le marqueur
        setMapCenter([latitude, longitude]);
        setSelectedLocation([latitude, longitude]);
        
        const placeName = display_name.split(',')[0];
        const detectedRegion = getRegionFromLocation(display_name);
        
        setFormData(prev => ({ 
          ...prev, 
          latitude, 
          longitude, 
          nom_lieu: placeName,
          region: detectedRegion || prev.region
        }));
      } else {
        alert("Lieu non trouvé. Essayez d'être plus précis (ex: Okola, Centre)");
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Participant Name validation
    if (!formData.participant_name || formData.participant_name.trim().length < 2) {
      newErrors.participant_name = "Votre nom est obligatoire pour le suivi collaboratif (min. 2 caractères).";
    }

    // Culture validation
    if (!formData.culture_type) {
      newErrors.culture_type = "La sélection d'une culture est obligatoire.";
    } else if (formData.culture_type === 'Autre') {
      const custom = formData.custom_culture.trim();
      if (!custom) {
        newErrors.custom_culture = 'Veuillez préciser le nom de la culture.';
      } else if (custom.length < 3) {
        newErrors.custom_culture = 'Le nom de la culture doit être explicite (min. 3 caractères).';
      } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(custom)) {
        newErrors.custom_culture = 'Le nom de la culture ne peut contenir que des lettres (pas de chiffres ni de symboles).';
      }
    }

    // Mandatory fields
    if (!formData.region) newErrors.region = "La région est obligatoire pour l'analyse géospatiale.";
    if (!formData.plantation_name || formData.plantation_name.length < 2) newErrors.plantation_name = 'Le nom de la plantation est requis (min. 2 caractères).';
    
    // Numeric validation
    if (!formData.surface || parseFloat(formData.surface) <= 0) {
      newErrors.surface = 'La surface doit être un nombre positif supérieur à zéro.';
    }
    if (!formData.quantite_engrais || parseFloat(formData.quantite_engrais) < 0) {
      newErrors.quantite_engrais = "La quantité d'engrais ne peut pas être négative.";
    }
    if (!formData.rendement_final || parseFloat(formData.rendement_final) <= 0) {
      newErrors.rendement_final = 'Le rendement final doit être renseigné et supérieur à zéro.';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.warn("Validation errors found:", newErrors);
      // Scroll to the first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Focus the field
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
        await axios.put(`${API_BASE}/collectes/${collecteId}`, payload);
        alert("Collecte modifiée avec succès !");
      } else {
        await axios.post(`${API_BASE}/collectes/`, payload);
        alert("Nouvelle collecte enregistrée avec succès !");
      }
      navigate('/collectes');
    } catch (error) {
      console.error('Erreur complète:', error);
      const msg = error.response?.data?.detail || "Erreur de connexion au serveur.";
      alert("Erreur lors de la sauvegarde : " + msg);
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
          <p className="font-body-md text-slate-500 max-w-2xl">Capturez les données de précision pour évaluer le rapport engrais / rendement.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            {/* Step 1 */}
            <div className="bg-white rounded-[16px] p-8 shadow-sm border border-emerald-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="font-h3 text-h3 text-emerald-900">Identification & Plantation</h3>
              </div>
              
              <div className="space-y-sm mb-6">
                <label className={`font-label-caps text-label-caps ${errors.participant_name ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                  {errors.participant_name && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                  NOM DU PARTICIPANT (VOUS) *
                </label>
                <input name="participant_name" value={formData.participant_name} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 ${errors.participant_name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md transition-all`} placeholder="Votre nom complet" />
                {errors.participant_name && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.participant_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-6">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.plantation_name ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                    {errors.plantation_name && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    NOM PLANTATION *
                  </label>
                  <input name="plantation_name" value={formData.plantation_name} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 ${errors.plantation_name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md transition-all`} placeholder="Ex. Ferme de Njombé" />
                  {errors.plantation_name && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.plantation_name}</p>}
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-slate-400">OPÉRATEUR DE TERRAIN</label>
                  <input name="operator" value={formData.operator} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-body-md" placeholder="Agronome responsable" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.culture_type ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                    {errors.culture_type && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    TYPE DE CULTURE *
                  </label>
                  <select name="culture_type" value={formData.culture_type} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 ${errors.culture_type ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md bg-white transition-all`}>
                    <option value="">Choisir...</option>
                    {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.culture_type && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.culture_type}</p>}
                </div>
                {formData.culture_type === 'Autre' && (
                  <div className="space-y-sm">
                    <label className={`font-label-caps text-label-caps ${errors.custom_culture ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                      {errors.custom_culture && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                      PRÉCISER CULTURE *
                    </label>
                    <input name="custom_culture" value={formData.custom_culture} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 ${errors.custom_culture ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-200'} focus:border-primary focus:ring-1 focus:ring-primary font-body-md transition-all`} placeholder="Ex. Poivre de Penja" />
                    {errors.custom_culture && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.custom_culture}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: NEW FIELDS */}
            <div className="bg-white rounded-[16px] p-8 shadow-sm border border-emerald-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="font-h3 text-h3 text-emerald-900">Localisation & Sol</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-6">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.region ? 'text-red-600 font-black' : 'text-slate-400'} uppercase tracking-widest`}>
                    {errors.region && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    Région *
                  </label>
                  <select name="region" value={formData.region} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 ${errors.region ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-slate-200'} font-body-md bg-white transition-all`}>
                    <option value="">Sélectionner Région</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.region}</p>}
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
                <input 
                  name="nom_lieu" 
                  value={formData.nom_lieu} 
                  onChange={handleInputChange} 
                  onBlur={() => {
                    if (formData.nom_lieu && !selectedLocation) {
                      setSearchQuery(formData.nom_lieu);
                      handleSearchLocation();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-body-md" 
                  placeholder="Ex: Okola, Cameroun" 
                />
                <p className="text-[10px] text-slate-400 italic">Utilisez la barre de recherche à droite ou cliquez sur "OK" pour placer le point.</p>
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
                  <label className={`font-label-caps text-xs ${errors.surface ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                    {errors.surface && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    SURFACE (HA) *
                  </label>
                  <input name="surface" value={formData.surface} onChange={handleInputChange} type="number" step="0.1" className={`w-full px-4 py-3 rounded-xl border-2 ${errors.surface ? 'border-red-500 bg-red-50' : 'border-slate-200'} font-body-md transition-all`} />
                  {errors.surface && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.surface}</p>}
                </div>
                <div className="space-y-sm">
                  <label className={`font-label-caps text-xs ${errors.quantite_engrais ? 'text-red-600 font-black' : 'text-slate-400'}`}>
                    {errors.quantite_engrais && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    ENGRAIS (KG) *
                  </label>
                  <input name="quantite_engrais" value={formData.quantite_engrais} onChange={handleInputChange} type="number" className={`w-full px-4 py-3 rounded-xl border-2 ${errors.quantite_engrais ? 'border-red-500 bg-red-50' : 'border-slate-200'} font-body-md transition-all`} />
                  {errors.quantite_engrais && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.quantite_engrais}</p>}
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-xs text-slate-400">EAU (m³) - OPTIONNEL</label>
                  <input name="volume_eau" value={formData.volume_eau} onChange={handleInputChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 font-body-md" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className={`font-label-caps text-label-caps ${errors.rendement_final ? 'text-red-600 font-black' : 'text-primary font-bold'}`}>
                    {errors.rendement_final && <span className="material-symbols-outlined text-xs mr-1">error</span>}
                    RENDEMENT FINAL (TONS) *
                  </label>
                  <input name="rendement_final" value={formData.rendement_final} onChange={handleInputChange} type="number" className={`w-full px-4 py-4 rounded-xl border-2 ${errors.rendement_final ? 'border-red-500 bg-red-50' : 'border-primary/20 bg-emerald-50/30'} text-xl font-bold text-primary transition-all`} />
                  {errors.rendement_final && <p className="text-[11px] text-red-600 font-bold mt-1 animate-pulse">{errors.rendement_final}</p>}
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
            <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-emerald-900/5">
              <div className="p-4 bg-emerald-50 border-b border-emerald-900/5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-emerald-900 text-sm">Géolocalisation</h4>
                  <button type="button" onClick={getCurrentLocation} title="Ma position actuelle" className="text-primary hover:bg-white p-1 rounded-full transition-colors">
                     <span className="material-symbols-outlined text-sm">my_location</span>
                  </button>
                </div>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                      placeholder="Rechercher un lieu..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-emerald-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    OK
                  </button>
                </div>
              </div>
              <div className="h-64 relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                  <MapClick onLocationSelect={handleLocationSelect} />
                  <MapRecenter center={mapCenter} />
                  {selectedLocation && <Marker position={selectedLocation} />}
                </MapContainer>
                {selectedLocation && (
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded-lg text-[10px] font-mono shadow-sm z-[400]">
                    {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-emerald-900/5">
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
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
