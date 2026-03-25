import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { getAuthData, saveAuthData, clearAuthData } from '../utils/storage';
import apiClient from '../api/client';

export const AuthContext = createContext();

// Handle how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
        
        // Try to refresh/register push token on every app boot
        registerForPushNotificationsAsync(authData.token);
      }
    } catch (e) {
      console.log('Auth Storage Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotificationsAsync = async (authToken) => {
    if (!Device.isDevice) return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get the token from Expo
      const expoPushTokenResponse = await Notifications.getExpoPushTokenAsync();
      const pushToken = expoPushTokenResponse.data;

      // Update the user profile in the backend with this token
      await apiClient.put('/auth/profile', { pushToken });
      console.log('✅ Push Token Registered:', pushToken);

    } catch (error) {
      console.log('Push Registration Error:', error.message);
    }
  };

  const login = async (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    await saveAuthData(userToken, userData);
    
    // Register for notifications immediately after login
    registerForPushNotificationsAsync(userToken);
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