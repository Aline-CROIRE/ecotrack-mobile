import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Global Context & Theme
import { theme } from './src/theme/theme';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Navigation Hub (Bottom Tabs)
import TabNavigator from './src/navigation/TabNavigator';

// --- SCREENS ---
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import NotificationScreen from './src/screens/NotificationScreen';

// COMMUNICATION SCREENS
import ChatListScreen from './src/screens/ChatListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';

// MODALS
import NewRequestScreen from './src/screens/NewRequestScreen';
import NewReportScreen from './src/screens/NewReportScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          {/* Main App */}
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* Operational Screens */}
          <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          
          {/* CHAT SYSTEM (Synchronized Names) */}
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />

          {/* Form Modals */}
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
            <StatusBar style="auto" /> 
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}