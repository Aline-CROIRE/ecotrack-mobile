import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Ensure this is exactly like this

// Screens
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#15803d', // Vibrant Forest Green
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { 
          height: 70, 
          paddingBottom: 15, 
          paddingTop: 10,
          backgroundColor: '#ffffff', // Ensure white background
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9'
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="warning" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;