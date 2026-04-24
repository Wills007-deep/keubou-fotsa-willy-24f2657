import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Accueil from './components/Accueil';
import FormulaireCollecte from './components/FormulaireCollecte';
import Dashboard from './components/Dashboard';
import ListeCollectes from './components/ListeCollectes';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/collectes" element={<ListeCollectes />} />
          <Route path="/formulaire" element={<FormulaireCollecte />} />
          <Route path="/formulaire/:id" element={<FormulaireCollecte />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
