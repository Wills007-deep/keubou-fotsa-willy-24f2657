import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    email: 'tp_visitor@agroanalytics.com',
    full_name: 'Visiteur TP',
    id: 'tp-visitor-id'
  });
  const [loading, setLoading] = useState(false);

  // Pour le TP, nous simulons un utilisateur toujours connecté
  const login = async () => true;
  const register = async () => true;
  const logout = () => {
    // Désactivé pour le TP
    console.log("Logout disabled for TP");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
