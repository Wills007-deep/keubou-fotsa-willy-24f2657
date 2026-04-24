import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClick({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FormulaireCollecte() {
  const navigate = useNavigate();
  const { id: collecteId } = useParams();
  const [isEdit, setIsEdit] = useState(!!collecteId);
  
  const [formData, setFormData] = useState({
    culture_type: '',
    plantation_name: '',
    operator: '',
    surface: '',
    quantite_engrais: '',
    volume_eau: '',
    rendement_final: '',
    date_recolte: '',
    nom_lieu: '',
    latitude: null,
    longitude: null,
  });

  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cropOptions] = useState(['Maïs', 'Riz', 'Manioc', 'Cacao', 'Blé', 'Soja']);

  useEffect(() => {
    if (isEdit && collecteId) {
      loadCollecte();
    } else {
      getCurrentLocation();
    }
  }, [collecteId, isEdit]);

  const loadCollecte = async () => {
    try {
      const response = await axios.get(`${API_BASE}/collectes/${collecteId}`);
      const collecte = response.data;
      setFormData({
        culture_type: collecte.culture_type,
        plantation_name: collecte.plantation_name || '',
        operator: collecte.operator || '',
        surface: collecte.surface,
        quantite_engrais: collecte.quantite_engrais,
        volume_eau: collecte.volume_eau || '',
        rendement_final: collecte.rendement_final,
        date_recolte: collecte.date_recolte ? new Date(collecte.date_recolte).toISOString().split('T')[0] : '',
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
      });
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setSelectedLocation([lat, lng]);
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
    if (!formData.culture_type) newErrors.culture_type = 'Sélectionner une culture';
    if (!formData.surface || parseFloat(formData.surface) <= 0) newErrors.surface = 'Surface requise';
    if (!formData.quantite_engrais || parseFloat(formData.quantite_engrais) < 0) newErrors.quantite_engrais = 'Quantité requise';
    if (!formData.rendement_final || parseFloat(formData.rendement_final) < 0) newErrors.rendement_final = 'Rendement requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        surface: parseFloat(formData.surface),
        quantite_engrais: parseFloat(formData.quantite_engrais),
        rendement_final: parseFloat(formData.rendement_final),
        volume_eau: formData.volume_eau ? parseFloat(formData.volume_eau) : null,
        date_recolte: formData.date_recolte ? new Date(formData.date_recolte).toISOString() : null,
      };

      if (isEdit) {
        await axios.put(`${API_BASE}/collectes/${collecteId}`, payload);
      } else {
        await axios.post(`${API_BASE}/collectes/`, payload);
      }
      navigate('/collectes');
    } catch (error) {
      console.error('Erreur:', error);
      let errorMsg = 'Erreur lors de la sauvegarde';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else {
          errorMsg = String(error.response.data.detail);
        }
      }
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full">

        <section className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-h2 text-h2 text-emerald-900 mb-2">{isEdit ? 'Modifier la Collecte' : 'Nouvelle Collecte de Rendement'}</h2>
            <p className="font-body-md text-slate-500 max-w-2xl">{isEdit ? 'Mettez à jour les informations enregistrées pour cette collecte.' : 'Enregistrez les données précises de votre récente récolte. Une entrée précise assure une analytique prédictive haute fidélité pour la saison suivante.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
            {/* Guided Form Section */}
            <div className="col-span-12 lg:col-span-8 space-y-gutter">
              {/* Step 1: Identity & Crop */}
              <div className="bg-white rounded-[16px] p-8 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="font-h3 text-h3 text-on-secondary-container">Informations Générales</h3>
                </div>
                <div className="grid grid-cols-2 gap-md mb-8">
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">business</span> NOM PLANTATION
                    </label>
                    <input 
                      name="plantation_name"
                      value={formData.plantation_name}
                      onChange={handleInputChange}
                      className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md" 
                      placeholder="Ex. Green Valley Estate" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">person</span> OPÉRATEUR
                    </label>
                    <input 
                      name="operator"
                      value={formData.operator}
                      onChange={handleInputChange}
                      className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md" 
                      placeholder="Nom complet" 
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychiatry</span> SÉLECTIONNER TYPE CULTURE
                  </label>
                  <select
                    name="culture_type"
                    value={formData.culture_type}
                    onChange={handleInputChange}
                    className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md bg-white"
                  >
                    <option value="">Sélectionner une culture</option>
                    {cropOptions.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  {errors.culture_type && <p className="text-error text-xs font-bold">{errors.culture_type}</p>}
                </div>
              </div>

              {/* Step 2: Control Variables */}
              <div className="bg-white rounded-[16px] p-8 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="font-h3 text-h3 text-on-secondary-container">Variables de Contrôle</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">area_chart</span> SURFACE (HA)
                    </label>
                    <div className="relative">
                      <input 
                        name="surface"
                        value={formData.surface}
                        onChange={handleInputChange}
                        className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md pr-12" 
                        placeholder="0.0" 
                        step="0.1" 
                        type="number"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">HA</span>
                    </div>
                    {errors.surface && <p className="text-error text-xs font-bold">{errors.surface}</p>}
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">science</span> ENGRAIS (KG)
                    </label>
                    <div className="relative">
                      <input 
                        name="quantite_engrais"
                        value={formData.quantite_engrais}
                        onChange={handleInputChange}
                        className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md pr-12" 
                        placeholder="0" 
                        type="number"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">KG</span>
                    </div>
                    {errors.quantite_engrais && <p className="text-error text-xs font-bold">{errors.quantite_engrais}</p>}
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">water_drop</span> EAU (m³)
                    </label>
                    <div className="relative">
                      <input 
                        name="volume_eau"
                        value={formData.volume_eau}
                        onChange={handleInputChange}
                        className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md pr-12" 
                        placeholder="0" 
                        type="number"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">m³</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Yield & System */}
              <div className="bg-white rounded-[16px] p-8 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="font-h3 text-h3 text-on-secondary-container">Résultats de Récolte</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl mb-8">
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">shopping_basket</span> RENDEMENT FINAL
                    </label>
                    <div className="relative">
                      <input 
                        name="rendement_final"
                        value={formData.rendement_final}
                        onChange={handleInputChange}
                        className={`w-full px-md py-4 rounded-xl border-2 font-body-lg font-semibold pr-16 transition-all ${
                          errors.rendement_final 
                            ? 'border-error text-error placeholder:text-error/50 focus:ring-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                        }`} 
                        placeholder={errors.rendement_final ? "Requis" : "0"} 
                        type="number"
                      />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold ${errors.rendement_final ? 'text-error' : 'text-slate-400'}`}>TONS</span>
                    </div>
                    {errors.rendement_final && (
                      <p className="text-error text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> {errors.rendement_final}
                      </p>
                    )}
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span> DATE DE RÉCOLTE
                    </label>
                    <input 
                      name="date_recolte"
                      value={formData.date_recolte}
                      onChange={handleInputChange}
                      className="w-full px-md py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-md" 
                      type="date"
                    />
                  </div>
                </div>

                {/* Explicit Parcelle Field */}
                <div className="space-y-sm mb-8">
                  <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">location_on</span> LIEU / PARCELLE
                  </label>
                  <input
                    type="text"
                    name="nom_lieu"
                    value={formData.nom_lieu}
                    onChange={handleInputChange}
                    placeholder="Ex: Parcelle Nord-Est"
                    className="w-full px-md py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
                  />
                </div>

                <div className="p-6 bg-surface-container-low rounded-2xl border border-emerald-900/5 flex flex-col md:flex-row items-center justify-between gap-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900">Localisation Parcelle</p>
                      <p className="text-sm text-slate-500">Capturer automatiquement les coordonnées GPS</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={getCurrentLocation}
                    className="bg-secondary text-on-primary px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[20px]">gps_fixed</span>
                    Géolocaliser
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-md pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/collectes')} 
                  className="px-8 py-4 text-primary font-bold hover:bg-emerald-50 rounded-2xl transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Soumettre'}
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
              {errors.submit && <p className="text-error text-sm font-bold text-right mt-2">{errors.submit}</p>}
            </div>

            {/* Right Sidebar Contextual Info & Map Preview */}
            <div className="col-span-12 lg:col-span-4 space-y-gutter">
              <div className="bg-primary-container rounded-[16px] p-6 text-on-primary-container shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                  <span className="material-symbols-outlined text-[120px]">analytics</span>
                </div>
                <h4 className="font-h3 text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">lightbulb</span>
                  Insight Rapide
                </h4>
                <p className="text-sm font-body-md mb-6 leading-relaxed opacity-90">Basé sur les données de la saison dernière pour cette région, le rendement moyen était de <span className="font-bold">4.2 tonnes/ha</span>. Assurez-vous que le volume d'eau correspond aux précipitations rapportées.</p>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest font-bold">Indice Qualité Données</span>
                    <span className="text-xs font-bold">85%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-fixed w-[85%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
                <div className="p-6 border-b border-emerald-900/5">
                  <h4 className="font-bold text-emerald-900">Aperçu Carte</h4>
                </div>
                <div className="h-64 bg-slate-100 relative z-0">
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClick onLocationSelect={handleLocationSelect} />
                    {selectedLocation && (
                      <Marker position={selectedLocation}>
                        <Popup>
                          Lat: {selectedLocation[0].toFixed(4)}, Lng: {selectedLocation[1].toFixed(4)}
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  
                  {formData.latitude && formData.longitude && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-emerald-900/5 shadow-sm z-[400] pointer-events-none">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">COORDONNÉES</p>
                      <p className="text-xs font-mono text-emerald-800">{formData.latitude.toFixed(4)}° N, {formData.longitude.toFixed(4)}° E</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
                <h4 className="font-bold text-emerald-900 mb-4">Soumissions Récentes</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-emerald-900/5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined">grain</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Secteur Nord A1</p>
                      <p className="text-[10px] text-slate-400">2.4 Tons • Il y a 2 jours</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-emerald-900/5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined">forest</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Cacao Crête Ouest</p>
                      <p className="text-[10px] text-slate-400">0.8 Tons • Il y a 5 jours</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
