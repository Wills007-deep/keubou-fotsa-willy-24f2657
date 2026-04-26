import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    icon: "science",
    badge: "TP · Analyse de Données",
    title: "Analyse Scientifique",
    description: "Bienvenue dans votre outil de TP. Notre mission est d'évaluer scientifiquement le rapport entre la quantité d'engrais utilisée et le rendement final d'une parcelle agricole.",
    bg: "from-emerald-900 to-emerald-700",
    accent: "#10b981"
  },
  {
    icon: "dataset",
    badge: "Collecte · Terrain",
    title: "Collecte Collaborative",
    description: "Enregistrez vos données de terrain et accédez instantanément aux relevés de vos collègues. La collaboration est la clé d'une analyse descriptive pertinente et fiable.",
    bg: "from-teal-900 to-teal-700",
    accent: "#14b8a6"
  },
  {
    icon: "analytics",
    badge: "Analyse · Export PDF",
    title: "Décision par la Donnée",
    description: "Visualisez les corrélations, calculez les indicateurs statistiques et exportez vos résultats en PDF. Transformez vos collectes en insights agronomiques de précision.",
    bg: "from-slate-900 to-slate-700",
    accent: "#6366f1"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleStart = () => {
    localStorage.setItem('onboarding_seen', 'true');
    navigate('/');
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-plus-jakarta-sans overflow-hidden">
      {/* Top Bar */}
      <div className="p-6 lg:p-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2D6A4F] rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-xl">potted_plant</span>
          </div>
          <span className="text-xl font-black text-[#1B4332] tracking-tight">AgroAnalytics</span>
        </div>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={() => setCurrentSlide(slides.length - 1)}
            className="text-sm font-bold text-slate-400 hover:text-[#2D6A4F] transition-colors"
          >
            Passer →
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-16 gap-12 max-w-7xl mx-auto w-full">

        {/* Visual Card */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className={`relative w-full max-w-[480px] aspect-square rounded-[40px] bg-gradient-to-br ${slide.bg} flex flex-col items-center justify-center gap-6 shadow-2xl overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
            {/* Icon */}
            <div className="relative z-10 w-28 h-28 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-xl">
              <span className="material-symbols-outlined text-[64px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                {slide.icon}
              </span>
            </div>
            {/* Mini badge on card */}
            <div className="relative z-10 px-5 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30">
              <span className="text-white text-xs font-black uppercase tracking-widest">{slide.badge}</span>
            </div>
            {/* Slide number */}
            <div className="absolute bottom-6 right-6 text-white/30 text-7xl font-black leading-none select-none">
              {currentSlide + 1}
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-[#2D6A4F] text-xs font-black uppercase tracking-widest border border-emerald-100">
              Étape {currentSlide + 1} / {slides.length}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#1B4332] leading-tight">
              {slide.title}
            </h1>
            <p className="text-base lg:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {slide.description}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center lg:justify-start gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-[#2D6A4F]' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            {currentSlide > 0 && (
              <button
                onClick={handleBack}
                className="w-full sm:w-auto px-8 py-4 text-[#1B4332] font-black hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
              >
                ← Retour
              </button>
            )}
            {currentSlide < slides.length - 1 ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto bg-[#2D6A4F] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Continuer
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="w-full bg-[#2D6A4F] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Commencer l'Étude
                <span className="material-symbols-outlined">analytics</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        AgroAnalytics Intelligence • TP Analyse de Données 2026
      </div>
    </div>
  );
}
