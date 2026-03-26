import React, { useContext, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';
import ChatListScreen from '../screens/ChatListScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useContext(AuthContext);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // 1. HOOKS MUST BE CALLED FIRST
  const fetchUnreadCount = async () => {
    if (!user) return; // Safety check inside the function
    try {
      const res = await apiClient.get('/messages/unread');
      const total = res.data.data.reduce((acc, curr) => acc + curr.count, 0);
      setUnreadMessages(total);
    } catch (e) { console.log("Badge fetch error"); }
  };

  useFocusEffect(useCallback(() => { 
    fetchUnreadCount(); 
  }, [user]));

  // 2. GUARD CLAUSE COMES AFTER HOOKS
  if (!user) return null;

  const isCollector = user?.role === 'collector';
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 75, paddingBottom: 15, paddingTop: 10, borderTopWidth: 0, elevation: 20, backgroundColor: '#fff' }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> }} 
      />

      {(isCollector || isAdmin) && (
        <Tab.Screen name="Map" component={MapScreen} 
          options={{ 
            title: isAdmin ? 'City Map' : 'My Route',
            tabBarIcon: ({color}) => <Ionicons name="map" size={24} color={color} /> 
          }} 
        />
      )}

      <Tab.Screen name="Requests" component={RequestsScreen} 
        options={{ 
            title: isCollector ? 'Tasks' : 'Activity',
            tabBarIcon: ({color}) => <Ionicons name="list" size={24} color={color} /> 
        }} 
      />

      <Tab.Screen name="Inbox" component={ChatListScreen} 
        options={{ 
            tabBarBadge: unreadMessages > 0 ? unreadMessages : null,
            tabBarBadgeStyle: { backgroundColor: '#ef4444' },
            tabBarIcon: ({color}) => <Ionicons name="chatbubbles" size={24} color={color} /> 
        }} 
      />

      <Tab.Screen name="Reports" component={ReportsScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="warning" size={24} color={color} /> }} 
      />
      
      <Tab.Screen name="Profile" component={ProfileScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color} /> }} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;