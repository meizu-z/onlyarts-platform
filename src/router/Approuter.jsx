import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import Explore from '../pages/Explore';
import ExhibitionPage from '../pages/ExhibitionPage';
import PortfolioPage from '../pages/PortfolioPage';
import Subscriptions from '../pages/Subscriptions';
import SettingsPage from '../pages/SettingsPage';
import CreateArtistPage from '../pages/CreateArtistPage';
import LivestreamsPage from '../pages/LivestreamsPage';
import FavoritesPage from '../pages/FavoritesPage';
import WalletPage from '../pages/WalletPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-pulse text-[#f2e9dd]">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-pulse text-[#f2e9dd]">Loading...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout showSidebar={false} showFooter={true} />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<MainLayout showSidebar={false} showFooter={false} />}>
        <Route index element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
      </Route>

      <Route path="/register" element={<MainLayout showSidebar={false} showFooter={false} />}>
        <Route index element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
      </Route>

      {/* Protected Routes with Sidebar */}
      <Route element={<MainLayout showSidebar={true} showFooter={false} />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />

        <Route path="/exhibition/:id" element={
          <ProtectedRoute>
            <ExhibitionPage />
          </ProtectedRoute>
        } />

        <Route path="/portfolio/:username" element={
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        } />

        <Route path="/livestreams" element={
          <ProtectedRoute>
            <LivestreamsPage />
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />

        <Route path="/subscriptions" element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/create-artist" element={
          <ProtectedRoute>
            <CreateArtistPage />
          </ProtectedRoute>
        } />

        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;