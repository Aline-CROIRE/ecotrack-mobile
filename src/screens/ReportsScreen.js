import React, { useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle, Plus, ChevronRight, MessageSquare } from 'lucide-react-native';
import apiClient from '../api/client';

const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await apiClient.get('/reports');
      setReports(response.data.data);
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const renderItem = ({ item }) => (
    <ReportCard activeOpacity={0.8}>
      <StatusLine status={item.status} />
      <ReportContent>
        <ReportHeader>
          <ReportTitle numberOfLines={1}>{item.title}</ReportTitle>
          <StatusBadge status={item.status}>
            <StatusText status={item.status}>{item.status.toUpperCase()}</StatusText>
          </StatusBadge>
        </ReportHeader>
        <ReportDesc numberOfLines={2}>{item.description}</ReportDesc>
        <ReportFooter>
          <DateText>{new Date(item.createdAt).toLocaleDateString()}</DateText>
          <ChevronRight color="#cbd5e1" size={18} />
        </ReportFooter>
      </ReportContent>
    </ReportCard>
  );

  return (
    <Container>
      <Header>
        <View>
          <Title>Community Reports</Title>
          <Subtitle>Report issues or illegal dumping</Subtitle>
        </View>
        <AddButton onPress={() => navigation.navigate('NewReport')}>
          <Plus color="#fff" size={24} />
        </AddButton>
      </Header>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchReports();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyContainer>
              <MessageSquare size={48} color="#cbd5e1" />
              <EmptyText>No reports submitted yet.</EmptyText>
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
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #e2e8f0; `;
const Title = styled.Text` font-size: 22px; font-weight: 800; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 13px; color: #64748b; margin-top: 2px; `;
const AddButton = styled.TouchableOpacity` background: #15803d; width: 45px; height: 45px; border-radius: 12px; justify-content: center; align-items: center; elevation: 4; `;
const ReportCard = styled.TouchableOpacity` background: #fff; border-radius: 16px; margin-bottom: 15px; flex-direction: row; overflow: hidden; border: 1px solid #f1f5f9; elevation: 2; `;
const StatusLine = styled.View` width: 5px; background: ${props => props.status === 'resolved' ? '#16a34a' : '#ef4444'}; `;
const ReportContent = styled.View` flex: 1; padding: 16px; `;
const ReportHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 8px; `;
const ReportTitle = styled.Text` font-size: 16px; font-weight: 700; color: #1e293b; flex: 1; margin-right: 10px; `;
const StatusBadge = styled.View` background: ${props => props.status === 'resolved' ? '#dcfce7' : '#fee2e2'}; padding: 4px 8px; border-radius: 6px; `;
const StatusText = styled.Text` font-size: 10px; font-weight: 800; color: ${props => props.status === 'resolved' ? '#16a34a' : '#ef4444'}; `;
const ReportDesc = styled.Text` font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 18px; `;
const ReportFooter = styled.View` flex-direction: row; justify-content: space-between; align-items: center; `;
const DateText = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 600; `;
const EmptyContainer = styled.View` align-items: center; margin-top: 60px; `;
const EmptyText = styled.Text` margin-top: 10px; color: #94a3b8; font-size: 16px; `;

export default ReportsScreen;