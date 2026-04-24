import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getNavLinkClass = (path, isSideNav = false) => {
    const isActive = location.pathname === path;
    
    if (isSideNav) {
      if (isActive) {
        return `flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 rounded-2xl font-semibold transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
      }
      return `flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-800/20 transition-all duration-300 rounded-2xl ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
    }

    if (isActive) {
      return "text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-700 pb-1";
    }
    return "text-slate-500 dark:text-slate-400 hover:text-emerald-700 transition-colors duration-200 pb-1";
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
      {/* TopNavBar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md font-plus-jakarta-sans text-sm font-medium full-width top-0 z-50 border-b border-emerald-900/5 dark:border-emerald-100/10 shadow-sm flex justify-between items-center px-6 py-3 w-full fixed">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-emerald-50 rounded-lg text-emerald-800"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <Link to="/" className="text-xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tight flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">eco</span>
             {!isSidebarCollapsed && "AgroAnalytics"}
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <Link className={getNavLinkClass('/')} to="/">Accueil</Link>
            <Link className={getNavLinkClass('/dashboard')} to="/dashboard">Analyses</Link>
            <Link className={getNavLinkClass('/collectes')} to="/collectes">Collectes</Link>
          </div>
          <div className="flex items-center gap-3 border-l border-emerald-900/10 dark:border-emerald-100/10 pl-6 ml-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="material-symbols-outlined text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-full transition-colors duration-200">notifications</button>
            <div className="h-8 w-8 rounded-full bg-primary overflow-hidden ring-2 ring-emerald-500/20">
              <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmLXRDusl7tPjcUY2Ty45_dU3CKsRZZ8jDhAS_HC-EMs_LfuRWmAYXIU25Wy6G0BST5FOmDsFqFoyB-_KnTBTK0pUZojBtyzgxaj9flwnCNA76Cu3w9iQZFGPAQ6iPbKfXrMSje30uZ_42qXEefn75g86KjrAYl6Cgbqm8G_nP8CFX8t-ZLaANTdtShIZXeQp41Jprqhh0PAYeT9Nox4aLTrZ2HU00LRuyJekuJlaWto9ylBs2g2zVN9GqaWL0_SYYdw4tWz39mkTi"/>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-emerald-950 dark:bg-slate-900 border-r border-emerald-900/10 shadow-xl flex flex-col p-4 z-40 hidden md:flex transition-all duration-300`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-emerald-700 transition-colors border border-emerald-600"
        >
          <span className="material-symbols-outlined text-[16px]">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>

        <div className="flex flex-col gap-2 flex-grow overflow-hidden">
          <div className={`p-2 mb-6 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            <p className="text-xl font-black text-white">{isSidebarCollapsed ? 'AA' : 'AgroAnalytics'}</p>
            {!isSidebarCollapsed && <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Precision Farming</p>}
          </div>
          <nav className="space-y-2">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-900'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Accueil</span>}
            </Link>
            <Link to="/collectes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/collectes' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-900'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/collectes' ? {fontVariationSettings: "'FILL' 1"} : {}}>grass</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Collectes</span>}
            </Link>
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-900'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Analyses</span>}
            </Link>
          </nav>
          <div className="mt-auto mb-4">
            <Link to="/formulaire" className={`w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined">add_box</span>
              {!isSidebarCollapsed && "SAISIE"}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-[84px] px-6 md:px-8 pb-12 min-h-screen transition-all duration-300`}>
        <div className="max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
