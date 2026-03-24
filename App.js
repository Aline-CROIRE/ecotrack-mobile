import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme/theme';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: 'bold' }}>
          EcoTrack Mobile
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          Connecting to Cloud Backend...
        </Text>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}