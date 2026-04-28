import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.toString().includes('Loading chunk') || 
                          this.state.error?.toString().includes('dynamically imported module');

      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#1e293b', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ color: '#065f46', fontSize: '24px', marginBottom: '10px' }}>
            {isChunkError ? "Problème de connexion réseau" : "Oups ! Une erreur est survenue"}
          </h1>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px auto', color: '#64748b' }}>
            {isChunkError 
              ? "L'application n'a pas pu télécharger une partie de son code. Cela arrive souvent sur les connexions instables (Orange/MTN)."
              : "L'application a rencontré un problème inattendu."}
          </p>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#fff1f2', 
            borderRadius: '12px', 
            textAlign: 'left',
            fontSize: '12px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #fecaca',
            color: '#991b1b',
            marginBottom: '30px'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>Détail technique :</p>
            <code style={{ wordBreak: 'break-all' }}>{this.state.error?.toString()}</code>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#065f46',
                border: '1px solid #065f46',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Retour à l'accueil
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#065f46',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)'
              }}
            >
              Réessayer le chargement
            </button>
          </div>
          
          {isChunkError && (
            <p style={{ marginTop: '20px', fontSize: '10px', color: '#94a3b8' }}>
              💡 Astuce : Si le problème persiste, essayez de désactiver puis réactiver vos données mobiles.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
