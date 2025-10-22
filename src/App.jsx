import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Dashboard } from './pages/Dashboard';
import { ExplorePage } from './pages/ExplorePage';
import { ExhibitionPage } from './pages/ExhibitionPage';
import { LivestreamsPage } from './pages/LivestreamsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CreateArtistPage } from './pages/CreateArtistPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WalletPage } from './pages/WalletPage';
import { LoadingPaint } from './components/ui/LoadingStates';
import { ArtworkPage } from './pages/ArtworkPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Loading..." /></div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Loading..." /></div>;
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Landing page is special, it can be viewed by anyone but redirects logged-in users */}
      <Route path="/landing" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      {/* Protected routes that use the MainLayout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="exhibition" element={<ExhibitionPage />} />
        <Route path="livestreams" element={<LivestreamsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="create-artist" element={<CreateArtistPage />} />
        <Route path="portfolio/:username" element={<ProfilePage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="artwork/:id" element={<ArtworkPage />} />
      </Route>

      {/* Fallback to redirect root to either landing or dashboard */}
      <Route path="/" element={<Navigate to="/landing" />} />

      {/* Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
