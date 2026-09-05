// =======================================================
// Authentication Context & State Provider
// =======================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

/**
 * Returns the exact role-based dashboard route specified by user requirements:
 * User → /user/dashboard
 * Volunteer → /volunteer/dashboard
 * NGO → /ngo/dashboard
 * Admin → /admin/dashboard
 */
export function getRoleDashboardPath(role) {
  switch (role) {
    case 'volunteer':
      return '/volunteer/dashboard';
    case 'ngo':
      return '/ngo/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'user':
    default:
      return '/user/dashboard';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sevasetu_token') || null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);

  // Check current session on initial load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    async function checkDb() {
      try {
        const res = await authAPI.getDbStatus();
        setDbStatus(res.data);
      } catch (e) {
        // non-blocking
      }
    }

    loadUser();
    checkDb();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('sevasetu_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data?.success) {
      const { token: jwtToken, user: newUser } = res.data;
      localStorage.setItem('sevasetu_token', jwtToken);
      setToken(jwtToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const demoLogin = async (role) => {
    const res = await authAPI.demoLogin(role);
    if (res.data?.success) {
      const { token: jwtToken, user: demoUser } = res.data;
      localStorage.setItem('sevasetu_token', jwtToken);
      setToken(jwtToken);
      setUser(demoUser);
      return demoUser;
    }
    throw new Error(res.data?.message || 'Demo login failed');
  };

  const logout = () => {
    try {
      authAPI.logout().catch(() => {});
    } catch (e) {
      // safe fallback
    }
    localStorage.removeItem('sevasetu_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser, newToken) => {
    if (newToken) {
      localStorage.setItem('sevasetu_token', newToken);
      setToken(newToken);
    }
    setUser(updatedUser);
  };

  const updateProfile = async (profileData) => {
    const res = await authAPI.updateProfile(profileData);
    if (res.data?.success) {
      const { user: updatedUser, token: newToken } = res.data;
      updateUser(updatedUser, newToken);
      return updatedUser;
    }
    throw new Error(res.data?.message || 'Failed to update profile');
  };

  const becomeVolunteer = async (volunteerData) => {
    const res = await authAPI.becomeVolunteer(volunteerData);
    if (res.data?.success) {
      const { user: updatedUser, token: newToken } = res.data;
      updateUser(updatedUser, newToken);
      return res.data;
    }
    throw new Error(res.data?.message || 'Failed to register as volunteer');
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        dbStatus,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        updateProfile,
        becomeVolunteer,
        hasRole,
        isAuthenticated: !!user,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

