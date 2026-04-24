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
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#1e293b' }}>
          <h1 style={{ color: '#065f46' }}>Oups ! Une erreur est survenue.</h1>
          <p>L'application n'a pas pu démarrer correctement.</p>
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px', 
            textAlign: 'left',
            fontSize: '14px',
            overflowX: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            <code style={{ color: '#ba1a1a' }}>{this.state.error?.toString()}</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#065f46',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
