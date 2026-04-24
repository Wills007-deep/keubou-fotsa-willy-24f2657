import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col lg:flex-row">
      
      {/* Mobile Topbar */}
      <header className="mobile-topbar shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">potted_plant</span>
          </div>
          <span className="text-lg font-bold text-primary dark:text-emerald-100 tracking-tight font-h1">AgroAnalytics</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="p-2 text-slate-400">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button onClick={toggleDarkMode} className="p-2 text-slate-400">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm flex-col p-4 z-40 transition-all duration-300`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center shadow-md z-50 hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-[16px]">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>

        <div className="flex flex-col gap-2 flex-grow overflow-hidden">
          <div className={`p-2 mb-6 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            <p className="text-xl font-black text-primary dark:text-emerald-100">{isSidebarCollapsed ? 'AA' : 'AgroAnalytics'}</p>
            {!isSidebarCollapsed && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Precision Farming</p>}
          </div>

          {/* User Info */}
          {!isSidebarCollapsed && user && (
            <div className="px-4 py-3 mb-6 bg-emerald-50 dark:bg-slate-800/50 rounded-2xl border border-emerald-100 dark:border-slate-800 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                 {user.full_name?.charAt(0) || 'U'}
               </div>
               <div className="min-w-0">
                 <p className="text-xs font-bold text-emerald-900 dark:text-white truncate">{user.full_name}</p>
                 <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
               </div>
            </div>
          )}

          <nav className="space-y-2">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-primary dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Accueil</span>}
            </Link>
            <Link to="/collectes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/collectes' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-primary dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/collectes' ? {fontVariationSettings: "'FILL' 1"} : {}}>grass</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Collectes</span>}
            </Link>
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-primary dark:text-emerald-100 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <span className="material-symbols-outlined" style={location.pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
              {!isSidebarCollapsed && <span className="font-plus-jakarta-sans text-sm font-medium">Analyses</span>}
            </Link>
          </nav>
          <div className="mt-6">
            <Link to="/formulaire" className={`w-full bg-primary-container dark:bg-emerald-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined">add_box</span>
              {!isSidebarCollapsed && "COLLECTE"}
            </Link>
          </div>

          <div className="mt-auto space-y-1">
             <button 
               onClick={toggleDarkMode}
               className={`w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             >
               <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
               {!isSidebarCollapsed && <span className="text-sm font-medium">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
             </button>
             <button 
               onClick={logout}
               className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             >
               <span className="material-symbols-outlined">logout</span>
               {!isSidebarCollapsed && <span className="text-sm font-medium">Déconnexion</span>}
             </button>
          </div>
        </div>
      </aside>


      {/* Main Content Area */}
      <main className={`main-area flex-grow transition-all duration-300 lg:${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="bottom-nav">
        <Link to="/" className={`bottom-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <span className="material-symbols-outlined" style={location.pathname === '/' ? {fontVariationSettings: "'FILL' 1"} : {}}>home</span>
          <span>Accueil</span>
        </Link>
        <Link to="/collectes" className={`bottom-nav-link ${location.pathname === '/collectes' ? 'active' : ''}`}>
          <span className="material-symbols-outlined" style={location.pathname === '/collectes' ? {fontVariationSettings: "'FILL' 1"} : {}}>grass</span>
          <span>Collectes</span>
        </Link>
        
        <Link to="/formulaire" className="bottom-nav-fab">
          <span className="material-symbols-outlined">add</span>
        </Link>

        <Link to="/dashboard" className={`bottom-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <span className="material-symbols-outlined" style={location.pathname === '/dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>analytics</span>
          <span>Analyses</span>
        </Link>
        <button onClick={toggleDarkMode} className="bottom-nav-link">
          <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          <span>Thème</span>
        </button>
      </nav>
    </div>
  );
}
