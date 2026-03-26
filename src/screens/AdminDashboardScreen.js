import React, { useState, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { Shield, Users, Activity, Award, MapPin } from 'lucide-react-native';

const AdminDashboardScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await apiClient.get('/analytics/admin-overview');
      setData(res.data);
    } catch (e) { console.log("Admin Data Error"); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchAdminData(); }, []));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <View>
            <Title>God-Mode Panel</Title>
            <Subtitle>City-wide Waste Control</Subtitle>
          </View>
          <ShieldIcon><Shield color="#fff" size={24} /></ShieldIcon>
        </Header>

        {/* 1. KEY METRICS */}
        <MetricsRow>
          <MetricCard>
            <Users color="#15803d" size={20} />
            <MetricValue>{data.totals.users}</MetricValue>
            <MetricLabel>Total Users</MetricLabel>
          </MetricCard>
          <MetricCard>
            <Activity color="#2563eb" size={20} />
            <MetricValue>{data.totals.requests}</MetricValue>
            <MetricLabel>Total Tasks</MetricLabel>
          </MetricCard>
        </MetricsRow>

        {/* 2. CITY WASTE HEATMAP */}
        <SectionTitle>Waste Hotspots (Heatmap)</SectionTitle>
        <MapWrapper>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{ latitude: -1.9441, longitude: 30.0619, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
          >
            {data.heatmap.map((point, idx) => (
              <Marker
                key={idx}
                coordinate={{ latitude: point.location.coordinates[1], longitude: point.location.coordinates[0] }}
              >
                <HeatPoint priority={point.priority} />
              </Marker>
            ))}
          </MapView>
        </MapWrapper>

        {/* 3. COLLECTOR LEADERBOARD */}
        <SectionTitle>Collector Efficiency Ranking</SectionTitle>
        {data.rankings.map((collector, index) => (
          <RankingCard key={collector._id}>
            <RankNum>{index + 1}</RankNum>
            <RankInfo>
              <RankName>{collector.name}</RankName>
              <RankSub>{collector.completedCount} Cleanups • {collector.pendingCount} Active</RankSub>
            </RankInfo>
            <Award color={index === 0 ? "#f59e0b" : "#cbd5e1"} size={24} />
          </RankingCard>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 22px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 13px; color: #64748b; font-weight: 600; `;
const ShieldIcon = styled.View` background: #0f172a; padding: 10px; border-radius: 12px; `;
const MetricsRow = styled.View` flexDirection: row; padding: 15px; gap: 15px; `;
const MetricCard = styled.View` flex: 1; background: #fff; padding: 20px; border-radius: 20px; align-items: center; border: 1px solid #f1f5f9; elevation: 2; `;
const MetricValue = styled.Text` font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 10px; `;
const MetricLabel = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; `;
const SectionTitle = styled.Text` font-size: 16px; font-weight: 800; color: #0f172a; padding: 0 20px; margin-top: 10px; margin-bottom: 15px; `;
const MapWrapper = styled.View` height: 250px; margin: 0 20px; border-radius: 25px; overflow: hidden; border: 4px solid #fff; elevation: 5; `;
const HeatPoint = styled.View` width: 14px; height: 14px; border-radius: 7px; background: ${props => props.priority === 'high' ? 'rgba(220, 38, 38, 0.6)' : 'rgba(21, 128, 61, 0.6)'}; border: 2px solid #fff; `;
const RankingCard = styled.View` flex-direction: row; align-items: center; background: #fff; margin: 5px 20px; padding: 15px; border-radius: 15px; border: 1px solid #f1f5f9; `;
const RankNum = styled.Text` font-size: 18px; font-weight: 900; color: #cbd5e1; width: 30px; `;
const RankInfo = styled.View` flex: 1; margin-left: 10px; `;
const RankName = styled.Text` font-size: 16px; font-weight: 700; color: #1e293b; `;
const RankSub = styled.Text` font-size: 12px; color: #64748b; font-weight: 600; `;

export default AdminDashboardScreen;