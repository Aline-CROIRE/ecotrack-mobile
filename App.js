import React, { useContext, useEffect, useRef } from 'react';
import './src/i18n/i18n'; // MUST BE THE FIRST IMPORT
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// Global State
import { theme } from './src/theme/theme';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Navigation
import TabNavigator from './src/navigation/TabNavigator';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Feature Screens
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import MapScreen from './src/screens/MapScreen';

// Internal Account & Admin
import EditProfileScreen from './src/screens/EditProfileScreen';
import SupportScreen from './src/screens/SupportScreen';
import LegalScreen from './src/screens/LegalScreen';
import CollectorPerformanceScreen from './src/screens/CollectorPerformanceScreen';
import AdminUserListScreen from './src/screens/AdminUserListScreen';

// Modals
import NewRequestScreen from './src/screens/NewRequestScreen';
import NewReportScreen from './src/screens/NewReportScreen';

const Stack = createStackNavigator();

/**
 * PUSH NOTIFICATION HANDLER
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const RootNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Background Alert Listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 Global Alert Received");
    });

    // Deep-Link Tap Listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("🚀 Deep-Link Activated");
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  if (isLoading) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          {/* CORE SYSTEM */}
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* OPERATIONAL HUB */}
          <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="AdminMap" component={MapScreen} />

          {/* COMMUNICATION ENGINE */}
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />

          {/* ACCOUNT & MANAGEMENT */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Legal" component={LegalScreen} />
          <Stack.Screen name="CollectorPerformance" component={CollectorPerformanceScreen} />
          <Stack.Screen name="AdminUserList" component={AdminUserListScreen} />

          {/* DYNAMIC MODALS */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="NewRequest" component={NewRequestScreen} />
            <Stack.Screen name="NewReport" component={NewReportScreen} />
          </Stack.Group>
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" /> 
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}