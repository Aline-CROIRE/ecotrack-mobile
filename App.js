import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme/theme';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import NewRequestScreen from './src/screens/NewRequestScreen';
import NewReportScreen from './src/screens/NewReportScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import CollectorPerformanceScreen from './src/screens/CollectorPerformanceScreen';
import AdminUserListScreen from './src/screens/AdminUserListScreen';
import MapScreen from './src/screens/MapScreen'; // Used for both Collector and AdminMap

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);
  if (isLoading) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* NAVIGATION FIXES */}
          <Stack.Screen name="AdminMap" component={MapScreen} /> 
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          
          <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="CollectorPerformance" component={CollectorPerformanceScreen} />
          <Stack.Screen name="AdminUserList" component={AdminUserListScreen} />

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
    <ThemeProvider theme={theme}><AuthProvider><NavigationContainer><RootNavigator /></NavigationContainer></AuthProvider></ThemeProvider>
  );
}