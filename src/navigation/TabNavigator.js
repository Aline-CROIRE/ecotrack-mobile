import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen'; // New

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useContext(AuthContext);
  const isCollector = user?.role === 'collector';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 70, paddingBottom: 15, paddingTop: 10, backgroundColor: '#fff' }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> }} 
      />
      
      {/* COLLECTORS GET THE MAP TAB */}
      {isCollector && (
        <Tab.Screen name="Map" component={MapScreen} 
          options={{ tabBarIcon: ({color}) => <Ionicons name="map" size={24} color={color} /> }} 
        />
      )}

      <Tab.Screen name="Requests" component={RequestsScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="list" size={24} color={color} /> }} 
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