import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Info, CheckCircle, Trash2, ChevronLeft } from 'lucide-react-native';
import apiClient from '../api/client';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.data);
    } catch (e) {
      console.log('Error fetching notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const renderItem = ({ item }) => (
    <NotifyCard read={item.read}>
      <IconBox bg={item.read ? '#f8fafc' : '#f0fdf4'}>
        <Bell color={item.read ? '#94a3b8' : '#15803d'} size={20} />
      </IconBox>
      <NotifyContent>
        <NotifyTitle read={item.read}>{item.title}</NotifyTitle>
        <NotifyMessage numberOfLines={2}>{item.message}</NotifyMessage>
        <NotifyTime>{new Date(item.createdAt).toLocaleString()}</NotifyTime>
      </NotifyContent>
      {!item.read && <UnreadDot />}
    </NotifyCard>
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0f172a" size={28} />
        </BackButton>
        <HeaderTitle>Notifications</HeaderTitle>
        <View style={{ width: 28 }} />
      </Header>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchNotifications();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyContainer>
              <Bell size={48} color="#cbd5e1" />
              <EmptyText>All caught up!</EmptyText>
            </EmptyContainer>
          }
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #ffffff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const BackButton = styled.TouchableOpacity``;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const NotifyCard = styled.View` flex-direction: row; padding: 16px; background: ${props => props.read ? '#fff' : '#f0fdf4'}; border-radius: 15px; margin-bottom: 12px; border: 1px solid #f1f5f9; align-items: center; `;
const IconBox = styled.View` width: 45px; height: 45px; border-radius: 12px; background: ${props => props.bg}; justify-content: center; align-items: center; margin-right: 15px; `;
const NotifyContent = styled.View` flex: 1; `;
const NotifyTitle = styled.Text` font-size: 15px; font-weight: 800; color: ${props => props.read ? '#64748b' : '#0f172a'}; `;
const NotifyMessage = styled.Text` font-size: 13px; color: #64748b; margin-top: 2px; `;
const NotifyTime = styled.Text` font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: 600; `;
const UnreadDot = styled.View` width: 8px; height: 8px; border-radius: 4px; background: #15803d; `;
const EmptyContainer = styled.View` align-items: center; margin-top: 100px; `;
const EmptyText = styled.Text` margin-top: 10px; color: #94a3b8; font-size: 16px; `;

export default NotificationScreen;