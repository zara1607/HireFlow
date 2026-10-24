import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hireflow_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Stored HireFlow user data is invalid:', error);
      localStorage.removeItem('hireflow_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hireflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hireflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('hireflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('hireflow_token');
          localStorage.removeItem('hireflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('hireflow_token', res.token);
      localStorage.setItem('hireflow_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('hireflow_token', res.token);
      localStorage.setItem('hireflow_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('hireflow_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('hireflow_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const uploadResume = async (formData) => {
    const res = await authService.uploadResume(formData);
    if (res.success && res.resume) {
      const updatedUser = { ...user, resume: res.resume };
      setUser(updatedUser);
      localStorage.setItem('hireflow_user', JSON.stringify(updatedUser));
      return res.resume;
    }
    throw new Error(res.message || 'Failed to upload resume');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isRecruiter: user?.role === 'RECRUITER',
        isCandidate: user?.role === 'JOB_SEEKER',
        login,
        register,
        logout,
        updateProfile,
        uploadResume,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
