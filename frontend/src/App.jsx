import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Layout from './components/ui/Layout';
import Accueil from './components/Accueil';
import ListeCollectes from './components/ListeCollectes';
import FormulaireCollecte from './components/FormulaireCollecte';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes inside Layout */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Accueil />} />
                      <Route path="/collectes" element={<ListeCollectes />} />
                      <Route path="/formulaire" element={<FormulaireCollecte />} />
                      <Route path="/formulaire/:id" element={<FormulaireCollecte />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}


export default App;
