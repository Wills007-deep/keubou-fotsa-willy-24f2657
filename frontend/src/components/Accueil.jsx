import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full">
        {/* Hero Section */}
        <section className="grid grid-cols-12 gap-gutter mb-xl">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-h1 text-h1 text-on-surface mb-md">Nourrir demain avec la précision d'aujourd'hui.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
              Bienvenue dans votre centre de pilotage AgroAnalytics. Optimisez vos rendements grâce à une collecte de données précise et une analyse saisonnière en temps réel.
            </p>
            <div className="flex gap-md">
              <button 
                onClick={() => navigate('/formulaire')}
                className="bg-primary-container text-on-primary font-bold px-8 py-4 rounded-16 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
                Nouvelle Collecte
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="border border-primary-container text-primary-container font-semibold px-8 py-4 rounded-16 hover:bg-emerald-50 transition-colors"
              >
                Voir les analyses
              </button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <div className="relative h-[400px] w-full rounded-16 overflow-hidden shadow-[0px_4px_20px_rgba(27,67,50,0.08)] bg-emerald-100">
              <img 
                alt="Modern Farm" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZxLLCE0-cqItewveWId4LB-_sAXr40m4Pg73XwhATo22mnCxAo4lrCIkfRq2NrJcr6Sao6MilQ3jhaDUGKMWhzotoDeTaAnsAfBiuxX5vm9QgY31gExmVoCvDl6rtQ569owmyY_9mQgGZYkj_ii83htkvKPdYRqC6-GOWN23qibzvPM54Eym2nhuLKtPDJXd9SLPabfvm5o7koUz9SIZwxbmaCOI0KqjE0Bg7Dvrdbd5njbcqph1dsBQK26-imB-JjVI-fWhGzEcP"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>sensors</span>
                  <span className="font-label-caps text-on-secondary-fixed-variant">STATION MÉTÉO ACTIVE</span>
                </div>
                <p className="font-body-md text-emerald-900 mt-1">Sols : Humidité optimale (24%)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Overview Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Card 1: Current Season */}
          <div className="bg-white p-lg rounded-16 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
            <div className="flex justify-between items-start mb-md">
              <div className="bg-secondary-container p-3 rounded-xl">
                <span className="material-symbols-outlined text-on-secondary-container">calendar_today</span>
              </div>
              <span className="bg-emerald-50 text-primary-container px-3 py-1 rounded-full text-label-caps">EN COURS</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Saison : Printemps</h3>
            <p className="font-body-md text-on-surface-variant mb-lg">Période de croissance active. Monitoring quotidien recommandé pour le blé et le colza.</p>
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-[65%]"></div>
            </div>
            <p className="mt-2 font-label-caps text-on-surface-variant">Progression saisonnière : 65%</p>
          </div>

          {/* Card 2: Field Health */}
          <div className="bg-white p-lg rounded-16 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
            <div className="flex justify-between items-start mb-md">
              <div className="bg-secondary-container p-3 rounded-xl">
                <span className="material-symbols-outlined text-on-secondary-container">monitoring</span>
              </div>
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-label-caps">OPTIMAL</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Santé des parcelles</h3>
            <p className="font-body-md text-on-surface-variant mb-lg">NDVI moyen à 0.82. Aucune anomalie détectée sur les zones prioritaires A1 et B4.</p>
            <div className="flex items-baseline gap-2">
              <span className="font-data-display text-primary">+4.2%</span>
              <span className="font-body-md text-on-surface-variant">vs sem. dernière</span>
            </div>
          </div>

          {/* Card 3: Next Survey */}
          <div className="bg-white p-lg rounded-16 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
            <div className="flex justify-between items-start mb-md">
              <div className="bg-secondary-container p-3 rounded-xl">
                <span className="material-symbols-outlined text-on-secondary-container">assignment</span>
              </div>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-caps">PROCHAINEMENT</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Prochaine Collecte</h3>
            <p className="font-body-md text-on-surface-variant mb-lg">Analyse de sol prévue le 14 Mai pour la parcelle "La Vallée".</p>
            <button className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors font-body-md">
              Modifier le calendrier
            </button>
          </div>
        </section>

        {/* Bento Grid Insights Section */}
        <section className="mt-xl grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-8 bg-white p-lg rounded-16 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-h3 text-h3 text-on-surface">Données Environnementales</h3>
              <select className="border-none bg-surface-container-low rounded-lg font-body-md focus:ring-primary">
                <option>Derniers 7 jours</option>
                <option>Derniers 30 jours</option>
              </select>
            </div>
            <div className="h-64 w-full bg-emerald-50/30 rounded-xl flex items-center justify-center border border-dashed border-emerald-100 overflow-hidden relative">
              <div className="absolute inset-0 p-lg flex flex-col justify-end">
                <div className="flex items-end gap-2 h-32">
                  <div className="flex-1 bg-primary/20 rounded-t-lg h-[40%]"></div>
                  <div className="flex-1 bg-primary/40 rounded-t-lg h-[60%]"></div>
                  <div className="flex-1 bg-primary/30 rounded-t-lg h-[50%]"></div>
                  <div className="flex-1 bg-primary/60 rounded-t-lg h-[80%]"></div>
                  <div className="flex-1 bg-primary/50 rounded-t-lg h-[70%]"></div>
                  <div className="flex-1 bg-primary/80 rounded-t-lg h-[95%]"></div>
                  <div className="flex-1 bg-primary rounded-t-lg h-[90%]"></div>
                </div>
                <div className="flex justify-between mt-sm">
                  <span className="font-label-caps text-on-surface-variant">LUN</span>
                  <span className="font-label-caps text-on-surface-variant">MAR</span>
                  <span className="font-label-caps text-on-surface-variant">MER</span>
                  <span className="font-label-caps text-on-surface-variant">JEU</span>
                  <span className="font-label-caps text-on-surface-variant">VEN</span>
                  <span className="font-label-caps text-on-surface-variant">SAM</span>
                  <span className="font-label-caps text-on-surface-variant">DIM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-primary-container text-on-primary p-lg rounded-16 shadow-lg">
              <h4 className="font-label-caps opacity-80 mb-sm">ACTION RAPIDE</h4>
              <p className="font-h3 text-lg mb-lg">Besoin d'un diagnostic drone sur la parcelle Sud ?</p>
              <Link to="/formulaire" className="w-full bg-white text-primary-container font-bold py-3 rounded-xl active:scale-95 transition-transform font-body-md flex items-center justify-center">
                Commander Survey
              </Link>
            </div>
            <div className="bg-white p-lg rounded-16 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] border border-emerald-900/5">
              <div className="flex items-center gap-3 mb-md">
                <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>cloud</span>
                <h4 className="font-h3 text-lg">Météo Locale</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-data-display text-on-surface">19°C</span>
                  <p className="font-body-md text-on-surface-variant">Légères averses</p>
                </div>
                <span className="material-symbols-outlined text-5xl text-emerald-200">rainy</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
