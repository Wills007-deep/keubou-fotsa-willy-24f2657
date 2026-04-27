import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Analyse Scientifique",
    description: "Bienvenue dans votre outil de TP. Notre mission est d'évaluer scientifiquement le rapport entre la quantité d'engrais utilisée et le rendement final d'une parcelle.",
    image: "/onboarding_analyse.png",
    color: "#2D6A4F"
  },
  {
    title: "Collecte Collaborative",
    description: "Enregistrez vos données de terrain et accédez instantanément aux relevés de vos collègues. La collaboration est la clé d'une analyse descriptive pertinente.",
    image: "/onboarding_collecte.png",
    color: "#1B4332"
  },
  {
    title: "Décision par la Donnée",
    description: "Visualisez les corrélations et optimisez les intrants. Transformez vos collectes en indicateurs de performance pour une agriculture de précision moderne.",
    image: "/onboarding_decision.png",
    color: "#081c15"
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-plus-jakarta-sans">
      {/* Top Bar / Logo */}
      <div className="p-8 flex justify-between items-center">
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
            Passer
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-20 gap-12 max-w-7xl mx-auto w-full">
        {/* Image Area */}
        <div className="w-full lg:w-1/2 flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-100/50 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title} 
              loading={currentSlide === 0 ? "eager" : "lazy"}
              className="relative rounded-[32px] shadow-2xl border-4 border-white w-full max-w-[500px] object-cover aspect-square"
            />
          </div>
        </div>

        {/* Text Area */}
        <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-[#2D6A4F] text-xs font-black uppercase tracking-widest border border-emerald-100">
              Étape {currentSlide + 1} / {slides.length}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-[#1B4332] leading-tight transition-all duration-500">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 transition-all duration-500">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center lg:justify-start gap-3">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-[#2D6A4F]' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            {currentSlide < slides.length - 1 ? (
              <>
                {currentSlide > 0 && (
                  <button 
                    onClick={handleBack}
                    className="w-full sm:w-auto px-8 py-4 text-[#1B4332] font-black hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    Retour
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="w-full sm:w-auto bg-[#2D6A4F] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Continuer
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </>
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

      {/* Footer Info */}
      <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        AgroAnalytics Intelligence • TP Analyse de Données 2026
      </div>
    </div>
  );
}
