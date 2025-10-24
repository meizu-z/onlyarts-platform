import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { API_CONFIG } from '../config/api.config';
import { DEMO_USERS } from '../utils/constants';

const AuthContext = createContext(null);

// Flag to use demo mode (set to false when backend is ready)
const USE_DEMO_MODE = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('onlyarts_user');
      const token = localStorage.getItem(API_CONFIG.tokenKey);

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('onlyarts_user');
          localStorage.removeItem(API_CONFIG.tokenKey);
          localStorage.removeItem(API_CONFIG.refreshTokenKey);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // DEMO MODE: Check demo credentials
      if (USE_DEMO_MODE) {
        if (username === DEMO_USERS.premium.username && password === DEMO_USERS.premium.password) {
          const userData = { ...DEMO_USERS.premium };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('onlyarts_user', JSON.stringify(userData));
          // Store demo token
          localStorage.setItem(API_CONFIG.tokenKey, 'demo-token');
          return { success: true, user: userData };
        }
        return { success: false, error: 'Invalid credentials. Try mz123 / 12345' };
      }

      // REAL API MODE: Call backend
      const response = await authService.login(username, password);
      const { user: userData, token, refreshToken } = response;

      // Store user data and tokens
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('onlyarts_user', JSON.stringify(userData));
      localStorage.setItem(API_CONFIG.tokenKey, token);
      if (refreshToken) {
        localStorage.setItem(API_CONFIG.refreshTokenKey, refreshToken);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData) => {
    try {
      // DEMO MODE: Simulated registration
      if (USE_DEMO_MODE) {
        const newUser = {
          ...userData,
          subscription: 'free',
          role: 'fan',
          followers: 0,
          following: 0,
          favorites: 0,
          profilePicture: null
        };

        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('onlyarts_user', JSON.stringify(newUser));
        localStorage.setItem(API_CONFIG.tokenKey, 'demo-token');
        return { success: true, user: newUser };
      }

      // REAL API MODE: Call backend
      const response = await authService.register(userData);
      const { user: newUser, token, refreshToken } = response;

      // Store user data and tokens
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('onlyarts_user', JSON.stringify(newUser));
      localStorage.setItem(API_CONFIG.tokenKey, token);
      if (refreshToken) {
        localStorage.setItem(API_CONFIG.refreshTokenKey, refreshToken);
      }

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API if not in demo mode
      if (!USE_DEMO_MODE) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('onlyarts_user');
      localStorage.removeItem(API_CONFIG.tokenKey);
      localStorage.removeItem(API_CONFIG.refreshTokenKey);
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('onlyarts_user', JSON.stringify(updatedUser));
  };

  const updateSubscription = (tier) => {
    updateUser({ subscription: tier });
  };

  const toggleArtistMode = () => {
    updateUser({ isArtist: !user.isArtist });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateSubscription,
    toggleArtistMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;