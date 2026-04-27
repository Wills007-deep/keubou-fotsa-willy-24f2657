import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Layout from './components/ui/Layout';

// Lazy loaded components
const Accueil = lazy(() => import('./components/Accueil'));
const ListeCollectes = lazy(() => import('./components/ListeCollectes'));
const FormulaireCollecte = lazy(() => import('./components/FormulaireCollecte'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Onboarding = lazy(() => import('./components/Onboarding'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-primary font-bold animate-pulse">Chargement d'AgroAnalytics...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Collaborative Routes inside Layout */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Accueil />} />
                        <Route path="/collectes" element={<ListeCollectes />} />
                        <Route path="/formulaire" element={<FormulaireCollecte />} />
                        <Route path="/formulaire/:id" element={<FormulaireCollecte />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
