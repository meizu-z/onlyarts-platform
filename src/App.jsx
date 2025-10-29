import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';
import { initializeMockOrders } from './services/order.service';

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
import CreatePostPage from './pages/CreatePostPage';
import CreateArtworkPage from './pages/CreateArtworkPage';
import HostExhibitionPage from './pages/HostExhibitionPage';
import StartLivePage from './pages/StartLivePage';
import CartPage from './pages/CartPage';
import { ConsultationPage } from './pages/ConsultationPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import SalesDashboardPage from './pages/SalesDashboardPage';
import CommissionRequestPage from './pages/CommissionRequestPage';

// This component handles the initial redirection logic based on auth state.
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Initializing..." /></div>;
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

// This guard protects routes that require authentication.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Loading..." /></div>;
  }
  // If user is not authenticated, redirect them to the landing page.
  return isAuthenticated ? children : <Navigate to="/landing" replace />;
};

// This guard handles public routes like login/register, redirecting authenticated users to the dashboard.
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingPaint message="Loading..." /></div>;
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  // Initialize mock data on app mount
  useEffect(() => {
    initializeMockOrders();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
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
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/artwork/:id" element={<ArtworkPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/create-post" element={<CreatePostPage />} />
                <Route path="/create-artwork" element={<CreateArtworkPage />} />
                <Route path="/host-exhibition" element={<HostExhibitionPage />} />
                <Route path="/start-live" element={<StartLivePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/consultations" element={<ConsultationPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/sales" element={<SalesDashboardPage />} />
                <Route path="/request-commission" element={<CommissionRequestPage />} />
              </Route>

              {/* A catch-all route for any undefined paths. */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;