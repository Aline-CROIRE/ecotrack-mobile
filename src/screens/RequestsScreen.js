import React, { useState, useCallback, useContext } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { Clock, MapPin, ChevronRight, Package } from 'lucide-react-native';

const RequestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/requests');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'in-progress': return '#2563eb';
      case 'assigned': return '#15803d';
      default: return '#ca8a04';
    }
  };

  const renderItem = ({ item }) => (
    <Card activeOpacity={0.9} onPress={() => navigation.navigate('RequestDetail', { item })}>
      <CardHeader>
        <WasteBadge><WasteText>{item.wasteType}</WasteText></WasteBadge>
        <StatusBadge color={getStatusColor(item.status)}>
          <StatusText color={getStatusColor(item.status)}>{item.status}</StatusText>
        </StatusBadge>
      </CardHeader>

      <CardBody>
        <InfoRow>
          <MapPin size={16} color="#64748b" />
          <AddressText numberOfLines={1}>{item.location.address}</AddressText>
        </InfoRow>
        <InfoRow>
          <Clock size={16} color="#64748b" />
          <DateText>{new Date(item.scheduledDate).toDateString()}</DateText>
        </InfoRow>
      </CardBody>

      <CardFooter>
        <PriorityText priority={item.priority}>Priority: {item.priority.toUpperCase()}</PriorityText>
        <ChevronRight color="#cbd5e1" size={20} />
      </CardFooter>
    </Card>
  );

  return (
    <Container>
      <Header>
        <Title>{user?.role === 'collector' ? 'Assigned Tasks' : 'My Pickups'}</Title>
        <Subtitle>Manage and track waste collections</Subtitle>
      </Header>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchRequests();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyContainer>
              <Package size={48} color="#cbd5e1" />
              <EmptyText>No requests found</EmptyText>
            </EmptyContainer>
          }
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const Header = styled.View` padding: 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #e2e8f0; `;
const Title = styled.Text` font-size: 24px; font-weight: 800; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 14px; color: #64748b; margin-top: 4px; `;
const Card = styled.TouchableOpacity` background: #fff; border-radius: 20px; margin-bottom: 15px; padding: 16px; border: 1px solid #f1f5f9; elevation: 3; `;
const CardHeader = styled.View` flex-direction: row; justify-content: space-between; margin-bottom: 12px; `;
const WasteBadge = styled.View` background: #f0fdf4; padding: 4px 10px; border-radius: 8px; `;
const WasteText = styled.Text` color: #15803d; font-weight: 700; text-transform: capitalize; font-size: 11px; `;
const StatusBadge = styled.View` background: ${props => props.color + '15'}; padding: 4px 10px; border-radius: 8px; `;
const StatusText = styled.Text` color: ${props => props.color}; font-weight: 700; text-transform: uppercase; font-size: 10px; `;
const CardBody = styled.View` margin-bottom: 12px; `;
const InfoRow = styled.View` flex-direction: row; align-items: center; margin-bottom: 6px; `;
const AddressText = styled.Text` margin-left: 8px; font-size: 14px; color: #1e293b; font-weight: 500; flex: 1; `;
const DateText = styled.Text` margin-left: 8px; font-size: 13px; color: #64748b; `;
const CardFooter = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding-top: 10px; border-top-width: 1px; border-top-color: #f1f5f9; `;
const PriorityText = styled.Text` font-size: 11px; font-weight: 700; color: ${props => props.priority === 'high' ? '#dc2626' : '#64748b'}; `;
const EmptyContainer = styled.View` align-items: center; margin-top: 60px; `;
const EmptyText = styled.Text` margin-top: 10px; color: #94a3b8; font-size: 16px; `;

export default RequestsScreen;