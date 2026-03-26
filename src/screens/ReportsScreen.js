import React, { useState, useCallback, useContext } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ReportsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/reports');
      setReports(res.data.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  const renderItem = ({ item }) => (
    <ReportCard activeOpacity={0.9} onPress={() => navigation.navigate('ReportDetail', { report: item })}>
      <StatusIndicator color={item.status === 'resolved' ? '#16a34a' : '#ef4444'} />
      <ReportContent>
        <ReportHeader>
          <Badge status={item.status}>
            <StatusText status={item.status}>{item.status.toUpperCase()}</StatusText>
          </Badge>
          <DateText>{new Date(item.createdAt).toLocaleDateString()}</DateText>
        </ReportHeader>
        <Title numberOfLines={1}>{item.title}</Title>
        <Desc numberOfLines={2}>{item.description}</Desc>
        <ReportFooter>
            <RoleTag>{isAdmin ? `FROM: ${item.citizen?.name}` : "MY REPORT"}</RoleTag>
            <ChevronRight color="#cbd5e1" size={18} />
        </ReportFooter>
      </ReportContent>
    </ReportCard>
  );

  return (
    <Container>
      <Header>
        <View><MainTitle>{isAdmin ? "City Incidents" : "My Reports"}</MainTitle><Subtitle>Tracking system feedback</Subtitle></View>
        <AddBtn onPress={() => navigation.navigate('NewReport')}><Plus color="#fff" size={26} /></AddBtn>
      </Header>
      {loading && !refreshing ? <Centered><ActivityIndicator size="large" color="#15803d" /></Centered> : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchReports();}} />}
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #f8fafc; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const MainTitle = styled.Text` font-size: 22px; font-weight: 900; `;
const Subtitle = styled.Text` font-size: 12px; color: #64748b; `;
const AddBtn = styled.TouchableOpacity` background: #15803d; width: 48px; height: 48px; border-radius: 12px; justify-content: center; align-items: center; elevation: 4; `;
const ReportCard = styled.TouchableOpacity` background: #fff; border-radius: 20px; margin-bottom: 15px; flex-direction: row; border: 1px solid #f1f5f9; elevation: 2; overflow: hidden; `;
const StatusIndicator = styled.View` width: 6px; background: ${props => props.color}; `;
const ReportContent = styled.View` flex: 1; padding: 15px; `;
const ReportHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 10px; `;
const Badge = styled.View` background: ${props => props.status === 'resolved' ? '#dcfce7' : '#fee2e2'}; padding: 4px 8px; border-radius: 6px; `;
const StatusText = styled.Text` font-size: 9px; font-weight: 800; color: ${props => props.status === 'resolved' ? '#16a34a' : '#ef4444'}; `;
const DateText = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 700; `;
const Title = styled.Text` font-size: 16px; font-weight: 800; color: #1e293b; `;
const Desc = styled.Text` font-size: 13px; color: #64748b; margin-top: 5px; `;
const ReportFooter = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-top: 15px; border-top-width: 1px; border-top-color: #f8fafc; padding-top: 10px; `;
const RoleTag = styled.Text` font-size: 10px; font-weight: 800; color: #15803d; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;

export default ReportsScreen;