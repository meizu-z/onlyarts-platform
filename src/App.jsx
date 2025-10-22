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
import { ChatPage } from './pages/ChatPage';

// This component handles the initial redirection logic based on auth state.
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Initializing..." /></div>;
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

// This guard protects routes that require authentication.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Loading..." /></div>;
  }
  // If user is not authenticated, redirect them to the landing page.
  return isAuthenticated ? children : <Navigate to="/landing" replace />;
};

// This guard handles public routes like login/register, redirecting authenticated users to the dashboard.
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
          <Routes>
            {/* The root path redirects to the appropriate page based on auth state. */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public routes accessible to everyone. */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Protected routes wrapped in MainLayout. These require authentication. */}
            <Route 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/exhibition" element={<ExhibitionPage />} />
              <Route path="/livestreams" element={<LivestreamsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/create-artist" element={<CreateArtistPage />} />
              <Route path="/portfolio/:username" element={<ProfilePage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/artwork/:id" element={<ArtworkPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            {/* A catch-all route for any undefined paths. */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;