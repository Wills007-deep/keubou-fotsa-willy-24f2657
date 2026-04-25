import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const hasSeenOnboarding = localStorage.getItem('onboarding_seen');

  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}
