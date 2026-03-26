import React, { useState, useCallback } from 'react';
import { 
  FlatList, RefreshControl, ActivityIndicator, 
  View, TouchableOpacity, StatusBar, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Bell, ChevronLeft, AlertTriangle, 
  CheckCircle, Package, ArrowRight, CheckCheck 
} from 'lucide-react-native';
import apiClient from '../api/client';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (e) {
      console.log('Notification sync interrupted');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * DEEP LINKING ENGINE
   * Marks as read and navigates to the specific resource
   */
  const handleAlertAction = async (item) => {
    try {
      if (!item.read) {
        await apiClient.put(`/notifications/${item._id}/read`);
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, read: true } : n));
      }

      if (item.type === 'report') {
        const res = await apiClient.get(`/reports`);
        const target = res.data.data.find(r => r._id === item.relatedId);
        if (target) navigation.navigate('ReportDetail', { report: target });
        else Alert.alert("Resolved", "This report is no longer available.");
      } else {
        // Handle Requests/Assignments
        const res = await apiClient.get(`/requests/${item.relatedId}`);
        if (res.data.success) {
            navigation.navigate('RequestDetail', { item: res.data.data });
        } else {
            Alert.alert("Closed", "This mission has already been finalized.");
        }
      }
    } catch (e) {
      Alert.alert("Sync Error", "Unable to retrieve details right now.");
    }
  };

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const getAlertStyle = (type, read) => {
    if (type === 'report') return { icon: AlertTriangle, color: read ? '#94a3b8' : '#dc2626', bg: read ? '#f8fafc' : '#fef2f2' };
    if (type === 'assignment') return { icon: Package, color: read ? '#94a3b8' : '#2563eb', bg: read ? '#f8fafc' : '#eff6ff' };
    return { icon: CheckCircle, color: read ? '#94a3b8' : '#15803d', bg: read ? '#f8fafc' : '#f0fdf4' };
  };

  return (
    <Container>
      {/* 1. CLEAN SYSTEM TOP SEPARATION */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* 2. PREMIUM HEADER */}
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
          <ChevronLeft color="#0f172a" size={32} />
        </TouchableOpacity>
        <TitleSection>
            <Title>Alert Center</Title>
            <Subtitle>{notifications.filter(n => !n.read).length} UNRESOLVED ALERTS</Subtitle>
        </TitleSection>
        <TouchableOpacity style={{ padding: 10 }}>
            <CheckCheck color="#15803d" size={24} />
        </TouchableOpacity>
      </Header>

      {/* 3. ALERTS FEED */}
      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const style = getAlertStyle(item.type, item.read);
            const Icon = style.icon;
            return (
              <AlertCard 
                read={item.read} 
                activeOpacity={0.9} 
                onPress={() => handleAlertAction(item)}
              >
                <IconBox bg={style.bg}>
                    <Icon color={style.color} size={22} />
                </IconBox>

                <AlertContent>
                    <AlertTop>
                        <AlertTitle read={item.read}>{item.title}</AlertTitle>
                        <AlertDate>{new Date(item.createdAt).toLocaleDateString()}</AlertDate>
                    </AlertTop>
                    <AlertMessage read={item.read} numberOfLines={2}>{item.message}</AlertMessage>
                    <DeepLinkRow>
                        <DeepLinkText>VIEW MISSION DATA</DeepLinkText>
                        <ArrowRight color="#15803d" size={14} />
                    </DeepLinkRow>
                </AlertContent>

                {!item.read && <UnreadGlow />}
              </AlertCard>
            );
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchNotifications();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyState>
              <EmptyIconCircle><Bell size={40} color="#cbd5e1" /></EmptyIconCircle>
              <EmptyTitle>System Quiet</EmptyTitle>
              <EmptySub>No active alerts. We will notify you here when mission status changes.</EmptySub>
            </EmptyState>
          }
        />
      )}
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #f8fafc; `;

const Header = styled.View` 
  flex-direction: row; justify-content: space-between; align-items: center; 
  padding: 10px 15px 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9;
`;

const TitleSection = styled.View` align-items: center; `;
const Title = styled.Text` font-size: 20px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 9px; font-weight: 800; color: #15803d; letter-spacing: 1px; margin-top: 3px; `;

const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;

const AlertCard = styled.TouchableOpacity` 
  background: #ffffff; border-radius: 24px; padding: 20px; margin-bottom: 15px; 
  flex-direction: row; border: 1px solid #f1f5f9; 
  elevation: ${props => props.read ? 2 : 5};
  shadow-opacity: ${props => props.read ? 0.02 : 0.05};
  shadow-radius: 12px;
  shadow-color: #000;
`;

const IconBox = styled.View` 
  width: 52px; height: 52px; border-radius: 16px; 
  background: ${props => props.bg}; justify-content: center; align-items: center; 
`;

const AlertContent = styled.View` flex: 1; margin-left: 15px; `;

const AlertTop = styled.View` flex-direction: row; justify-content: space-between; align-items: center; `;

const AlertTitle = styled.Text` 
  font-size: 15px; font-weight: 800; 
  color: ${props => props.read ? '#64748b' : '#0f172a'}; 
`;

const AlertDate = styled.Text` font-size: 10px; color: #cbd5e1; font-weight: 700; `;

const AlertMessage = styled.Text` 
  font-size: 13px; color: #64748b; font-weight: 600; 
  margin-top: 5px; line-height: 18px;
  opacity: ${props => props.read ? 0.7 : 1};
`;

const DeepLinkRow = styled.View` flex-direction: row; align-items: center; gap: 5px; margin-top: 12px; `;
const DeepLinkText = styled.Text` font-size: 10px; font-weight: 900; color: #15803d; letter-spacing: 0.5px; `;

const UnreadGlow = styled.View` 
  width: 8px; height: 8px; border-radius: 4px; 
  background-color: #15803d; margin-left: 10px; align-self: center;
  border: 2px solid #fff;
`;

const EmptyState = styled.View` align-items: center; margin-top: 100px; padding: 40px; `;
const EmptyIconCircle = styled.View` width: 80px; height: 80px; border-radius: 40px; background: #fff; justify-content: center; align-items: center; elevation: 5; `;
const EmptyTitle = styled.Text` font-size: 20px; font-weight: 900; color: #1e293b; margin-top: 25px; `;
const EmptySub = styled.Text` text-align: center; color: #94a3b8; font-size: 14px; font-weight: 600; margin-top: 10px; line-height: 22px; `;

export default NotificationScreen;