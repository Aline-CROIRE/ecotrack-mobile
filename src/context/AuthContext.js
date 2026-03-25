import React, { createContext, useState, useEffect } from 'react';
import { getAuthData, saveAuthData, clearAuthData } from '../utils/storage';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const authData = await getAuthData();
      if (authData.token) {
        setToken(authData.token);
        setUser(authData.user);
        // Set default header for future API calls
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
      }
    } catch (e) {
      console.log('Failed to load storage', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    await saveAuthData(userToken, userData);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    await clearAuthData();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};