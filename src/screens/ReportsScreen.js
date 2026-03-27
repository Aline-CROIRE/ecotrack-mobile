import React, { useState, useCallback, useContext } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, ChevronRight, AlertCircle, CheckCircle2, Clock, MessageSquare, Shield } from 'lucide-react-native';
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
      setReports(res.data.data || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  const getStatusCfg = (status) => {
    switch (status) {
      case 'resolved': return { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2, label: 'RESOLVED' };
      case 'in-review': return { color: '#f59e0b', bg: '#fef3c7', icon: Clock, label: 'IN REVIEW' };
      default: return { color: '#dc2626', bg: '#fee2e2', icon: AlertCircle, label: 'NEW ISSUE' };
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />
      
      <Header>
        <View>
          <Title>{isAdmin ? "Incident Control" : "My Reports"}</Title>
          <Subtitle>{isAdmin ? "City-wide safety monitoring" : "Track your submissions"}</Subtitle>
        </View>
        <AddBtn onPress={() => navigation.navigate('NewReport')} activeOpacity={0.8}>
          <Plus color="#fff" size={28} />
        </AddBtn>
      </Header>

      {/* WORKFLOW SUMMARY BAR */}
      <SummaryBar>
          <SummaryTile>
              <TileCount color="#dc2626">{reports.filter(r => r.status === 'open').length}</TileCount>
              <TileLabel>OPEN</TileLabel>
          </SummaryTile>
          <Divider />
          <SummaryTile>
              <TileCount color="#f59e0b">{reports.filter(r => r.status === 'in-review').length}</TileCount>
              <TileLabel>REVIEW</TileLabel>
          </SummaryTile>
          <Divider />
          <SummaryTile>
              <TileCount color="#16a34a">{reports.filter(r => r.status === 'resolved').length}</TileCount>
              <TileLabel>SOLVED</TileLabel>
          </SummaryTile>
      </SummaryBar>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item._id}
          renderItem={({ item }) => {
            const cfg = getStatusCfg(item.status);
            return (
              <ReportCard activeOpacity={0.9} onPress={() => navigation.navigate('ReportDetail', { report: item })}>
                <StatusLine color={cfg.color} />
                <ReportBody>
                    <ReportHeader>
                        <StatusBadge bg={cfg.bg}>
                            <cfg.icon size={10} color={cfg.color} />
                            <StatusText color={cfg.color}>{cfg.label}</StatusText>
                        </StatusBadge>
                        <DateText>{new Date(item.createdAt).toLocaleDateString()}</DateText>
                    </ReportHeader>
                    <ReportTitle numberOfLines={1}>{item.title}</ReportTitle>
                    <ReportDesc numberOfLines={2}>{item.description}</ReportDesc>
                    <ReportFooter>
                        <ReporterInfo>
                            <Shield size={12} color={isAdmin ? "#0f172a" : "#15803d"} />
                            <ReporterName>{isAdmin ? `FROM: ${item.citizen?.name}` : "SUBMITTED BY YOU"}</ReporterName>
                        </ReporterInfo>
                        <ChevronRight color="#cbd5e1" size={18} />
                    </ReportFooter>
                </ReportBody>
              </ReportCard>
            );
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchReports();}} tintColor="#15803d" />}
          ListEmptyComponent={<EmptyBox><MessageSquare size={50} color="#cbd5e1" /><EmptyText>No reports found</EmptyText></EmptyBox>}
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #f8fafc; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 20px 25px; background: #fff; `;
const Title = styled.Text` font-size: 26px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; `;
const AddBtn = styled.TouchableOpacity` background: #15803d; width: 48px; height: 48px; border-radius: 14px; justify-content: center; align-items: center; elevation: 4; `;
const SummaryBar = styled.View` flex-direction: row; background: #fff; padding: 0 20px 25px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; justify-content: space-around; elevation: 10; shadow-opacity: 0.05; shadow-radius: 10px; `;
const SummaryTile = styled.View` align-items: center; `;
const TileCount = styled.Text` font-size: 20px; font-weight: 900; color: ${props => props.color}; `;
const TileLabel = styled.Text` font-size: 9px; font-weight: 800; color: #94a3b8; margin-top: 2px; `;
const Divider = styled.View` width: 1px; height: 25px; background: #f1f5f9; align-self: center; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const ReportCard = styled.TouchableOpacity` background: #fff; border-radius: 22px; margin-bottom: 14px; flex-direction: row; border: 1px solid #f1f5f9; elevation: 3; shadow-opacity: 0.05; shadow-radius: 10px; overflow: hidden; `;
const StatusLine = styled.View` width: 6px; background: ${props => props.color}; `;
const ReportBody = styled.View` flex: 1; padding: 18px; `;
const ReportHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 12px; `;
const StatusBadge = styled.View` flex-direction: row; align-items: center; background: ${props => props.bg}; padding: 5px 10px; border-radius: 8px; gap: 5px; `;
const StatusText = styled.Text` font-size: 9px; font-weight: 900; color: ${props => props.color}; `;
const DateText = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 800; `;
const ReportTitle = styled.Text` font-size: 17px; font-weight: 800; color: #1e293b; `;
const ReportDesc = styled.Text` font-size: 13px; color: #64748b; margin-top: 6px; line-height: 20px; `;
const ReportFooter = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-top: 18px; border-top-width: 1px; border-top-color: #f8fafc; padding-top: 12px; `;
const ReporterInfo = styled.View` flex-direction: row; align-items: center; gap: 6px; `;
const ReporterName = styled.Text` font-size: 10px; font-weight: 800; color: #15803d; `;
const EmptyBox = styled.View` align-items: center; margin-top: 80px; `;
const EmptyText = styled.Text` margin-top: 15px; color: #94a3b8; font-size: 16px; font-weight: 800; `;

export default ReportsScreen;