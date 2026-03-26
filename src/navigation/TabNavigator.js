import React, { useContext, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

// Screen Imports
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useContext(AuthContext);
  const [unreadMessages, setUnreadMessages] = useState(0);

  /**
   * 1. REAL-TIME BADGE ENGINE
   * Fetches unread message counts across the whole system
   */
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/messages/unread');
      // Calculate total sum of all unread messages from all partners
      const total = (res.data.data || []).reduce((acc, curr) => acc + curr.count, 0);
      setUnreadMessages(total);
    } catch (e) {
      console.log("Badge sync error");
    }
  };

  // Update badge every time the user interacts with the tabs
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [user])
  );

  /**
   * 2. LOGOUT SAFETY GUARD
   * Hooks are called above, so this return is now safe.
   */
  if (!user) return null;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#15803d', // Premium Emerald
        tabBarInactiveTintColor: '#94a3b8', // Muted Slate
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 75,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 20, // Shadow for Android
          shadowOpacity: 0.1, // Shadow for iOS
          shadowRadius: 10,
        },
      }}
    >
      {/* --- TAB 1: COMMAND CENTER --- */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          )
        }}
      />

      {/* --- TAB 2: MISSIONS / ACTIVITY --- */}
      <Tab.Screen 
        name="Activity" 
        component={RequestsScreen} 
        options={{
          title: user.role === 'collector' ? 'Missions' : 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "list" : "list-outline"} size={24} color={color} />
          )
        }}
      />

      {/* --- TAB 3: COMMUNICATION HUB --- */}
      <Tab.Screen 
        name="Inbox" 
        component={ChatListScreen} 
        options={{
          tabBarBadge: unreadMessages > 0 ? unreadMessages : null,
          tabBarBadgeStyle: { 
            backgroundColor: '#ef4444', 
            color: '#fff', 
            fontSize: 10, 
            fontWeight: '900' 
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} />
          )
        }}
      />

      {/* --- TAB 4: INTELLIGENCE HUB --- */}
      <Tab.Screen 
        name="Impact" 
        component={AnalyticsScreen} 
        options={{
          title: user.role === 'admin' ? 'Analytics' : 'Impact',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
          )
        }}
      />

      {/* --- TAB 5: IDENTITY & SETTINGS --- */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          )
        }}
      />

    </Tab.Navigator>
  );
};

export default TabNavigator;