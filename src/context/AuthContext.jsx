import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('onlyarts_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('onlyarts_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    // Check demo credentials
    if (username === DEMO_USERS.premium.username && password === DEMO_USERS.premium.password) {
      const userData = { ...DEMO_USERS.premium };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('onlyarts_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid credentials. Try mz123 / 12345' };
  };

  const register = (userData) => {
    // Simulated registration
    const newUser = {
      ...userData,
      subscription: 'free',
      isArtist: false,
      followers: 0,
      following: 0,
      favorites: 0,
      avatar: null
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('onlyarts_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('onlyarts_user');
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