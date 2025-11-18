import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import Auth from './components/Auth';
import VendorDashboard from './components/vendor/VendorDashboard';
import ClientDashboard from './components/client/ClientDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    if (showAuth) {
      return <Auth />;
    }
    return <HomePage onGetStarted={() => setShowAuth(true)} />;
  }

  if (profile.role === 'vendor') {
    return <VendorDashboard />;
  }

  return <ClientDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
