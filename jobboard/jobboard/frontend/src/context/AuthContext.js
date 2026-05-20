// ============================================================
// context/AuthContext.js
// Global authentication state using React Context
// Every page/component can access user info via useAuth()
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ─── Axios default config ─────────────────────────────────────
// Every axios request will include the JWT token if present
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// ─── Provider Component ───────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage

  // On app start, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setAuthHeader(token);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ─── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  };

  // ─── Register ──────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  };

  // ─── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthHeader(null);
    setUser(null);
  };

  // ─── Update user in state (after profile edit) ─────────────
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ─────────────────────────────────────────────
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
