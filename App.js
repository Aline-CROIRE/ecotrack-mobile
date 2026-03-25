import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Global Context & Theme
import { theme } from './src/theme/theme';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Navigation & Screens
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import NewRequestScreen from './src/screens/NewRequestScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          {/* Main App with Tabs */}
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* Functional Modals */}
          <Stack.Screen 
            name="NewRequest" 
            component={NewRequestScreen} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="RequestDetail" 
            component={RequestDetailScreen} 
            options={{ presentation: 'card' }} 
          />
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