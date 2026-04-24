import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getNavLinkClass = (path, isSideNav = false) => {
    const isActive = location.pathname === path;
    
    if (isSideNav) {
      if (isActive) {
        return "w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 rounded-2xl font-semibold transition-all duration-300";
      }
      return "w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-800/20 transition-all duration-300 rounded-2xl";
    }

    // TopNav classes
    if (isActive) {
      return "text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-700 pb-1";
    }
    return "text-slate-500 dark:text-slate-400 hover:text-emerald-700 transition-colors duration-200 pb-1";
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white dark:bg-slate-900 font-plus-jakarta-sans text-sm font-medium full-width top-0 z-50 border-b border-emerald-900/5 dark:border-emerald-100/10 shadow-[0px_4px_20px_rgba(27,67,50,0.08)] flex justify-between items-center px-6 py-3 w-full fixed">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-emerald-50 rounded-lg text-emerald-800"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <Link to="/" className="text-xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tight">AgroAnalytics</Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <Link className={getNavLinkClass('/')} to="/">Tableau de bord</Link>
            <Link className={getNavLinkClass('/dashboard')} to="/dashboard">Analyses</Link>
            <Link className={getNavLinkClass('/collectes')} to="/collectes">Parcelles</Link>
          </div>
          <div className="flex items-center gap-4 border-l border-emerald-900/10 pl-6 ml-2">
            <button className="material-symbols-outlined text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-full transition-colors duration-200">notifications</button>
            <div className="h-8 w-8 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-primary-container/10">
              <img alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmLXRDusl7tPjcUY2Ty45_dU3CKsRZZ8jDhAS_HC-EMs_LfuRWmAYXIU25Wy6G0BST5FOmDsFqFoyB-_KnTBTK0pUZojBtyzgxaj9flwnCNA76Cu3w9iQZFGPAQ6iPbKfXrMSje30uZ_42qXEefn75g86KjrAYl6Cgbqm8G_nP8CFX8t-ZLaANTdtShIZXeQp41Jprqhh0PAYeT9Nox4aLTrZ2HU00LRuyJekuJlaWto9ylBs2g2zVN9GqaWL0_SYYdw4tWz39mkTi"/>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-white dark:bg-slate-900 border-r border-emerald-900/5 dark:border-emerald-100/10 shadow-sm flex flex-col p-4 z-40 hidden md:flex">
        <div className="flex flex-col gap-2 flex-grow">
          <div className="p-2 mb-4">
            <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">AgroAnalytics</p>
            <p className="text-xs text-on-surface-variant font-medium">Precision Agriculture</p>
          </div>
          <nav className="space-y-1">
            <Link to="/" className={getNavLinkClass('/', true)}>
              <span className="material-symbols-outlined" style={location.pathname === '/' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
              <span className="font-plus-jakarta-sans text-sm">Home</span>
            </Link>
            <Link to="/collectes" className={getNavLinkClass('/collectes', true)}>
              <span className="material-symbols-outlined" style={location.pathname === '/collectes' ? {fontVariationSettings: "'FILL' 1"} : {}}>grass</span>
              <span className="font-plus-jakarta-sans text-sm">Collection</span>
            </Link>
            <Link to="/dashboard" className={getNavLinkClass('/dashboard', true)}>
              <span className="material-symbols-outlined" style={location.pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
              <span className="font-plus-jakarta-sans text-sm">Insights</span>
            </Link>
          </nav>
          <div className="mt-8">
            <Link to="/formulaire" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform hover:brightness-110">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Survey
            </Link>
          </div>
        </div>
        <div className="border-t border-emerald-900/5 pt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-800/20 transition-all duration-300 rounded-2xl">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-plus-jakarta-sans text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-800/20 transition-all duration-300 rounded-2xl">
            <span className="material-symbols-outlined">help_outline</span>
            <span className="font-plus-jakarta-sans text-sm">Support</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-emerald-900">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="material-symbols-outlined">close</button>
            </div>
            <nav className="space-y-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className={getNavLinkClass('/', true)}>
                <span className="material-symbols-outlined">home</span> Home
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/collectes" className={getNavLinkClass('/collectes', true)}>
                <span className="material-symbols-outlined">grass</span> Collection
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={getNavLinkClass('/dashboard', true)}>
                <span className="material-symbols-outlined">analytics</span> Insights
              </Link>
            </nav>
            <div className="mt-auto pt-8">
               <Link 
                 to="/formulaire" 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
               >
                 <span className="material-symbols-outlined">add</span> New Survey
               </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-64 pt-[84px] px-6 md:px-8 pb-12 min-h-screen">
        <div className="max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Link to="/formulaire" className="bg-primary text-on-primary h-14 w-14 rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform hover:brightness-110">
          <span className="material-symbols-outlined">add</span>
        </Link>
      </div>
    </div>
  );
}
