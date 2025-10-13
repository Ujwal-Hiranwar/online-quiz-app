import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    console.log("AUTH-CONTEXT: Calling authService.login with:", credentials);
    const data = await authService.login(credentials);
    const user = {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
    };
    setUser(user);
    return data;
  };

  const signup = async (userData) => {
    console.log("AUTH-CONTEXT: Calling authService.signup with:", userData);
    const data = await authService.signup(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
