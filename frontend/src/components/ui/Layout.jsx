import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-200 hover:bg-emerald-900'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex">
      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-screen ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm flex flex-col p-4 z-40 transition-all duration-300`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center shadow-md z-50 hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[16px]">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>

        <div className="flex flex-col gap-2 flex-grow overflow-hidden">
          <div className={`p-2 mb-6 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">{isSidebarCollapsed ? 'AA' : 'AgroAnalytics'}</p>
            {!isSidebarCollapsed && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Precision Farming</p>}
          </div>
          <nav className="space-y-2">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Accueil</span>}
            </Link>
            <Link to="/collectes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/collectes' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/collectes' ? {fontVariationSettings: "'FILL' 1"} : {}}>grass</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Collectes</span>}
            </Link>
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Analyses</span>}
            </Link>
          </nav>
          <div className="mt-6">
            <Link to="/formulaire" className={`w-full bg-emerald-900 dark:bg-emerald-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined">add_box</span>
              {!isSidebarCollapsed && "COLLECTE"}
            </Link>
          </div>

          <div className="mt-auto">
             <button 
               onClick={toggleDarkMode}
               className={`w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             >
               <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
               {!isSidebarCollapsed && <span className="text-sm font-medium">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex-grow p-8 min-h-screen transition-all duration-300`}>
        <div className="max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
