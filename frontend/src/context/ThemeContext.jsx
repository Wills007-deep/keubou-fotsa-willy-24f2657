import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('agroanalytics-theme');
      // If no saved preference, ALWAYS default to light (false)
      if (saved) return saved === 'dark';
      return false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('agroanalytics-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('agroanalytics-theme', 'light');
      }
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
