import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getAuthData, saveAuthData, clearAuthData } from '../utils/storage';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStorageData(); }, []);

  const loadStorageData = async () => {
    try {
      const authData = await getAuthData();
      if (authData.token) {
        setToken(authData.token);
        setUser(authData.user);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
      }
    } catch (e) { console.log('Storage Error'); } 
    finally { setIsLoading(false); }
  };

  /**
   * NEW: RELOAD USER
   * Fetches fresh user data from backend and updates global state
   */
  const reloadUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data);
      // Save updated user to local storage too
      await saveAuthData(token, res.data);
    } catch (e) { console.log("User reload failed"); }
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
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};