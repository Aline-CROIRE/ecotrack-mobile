import React, { useState, useCallback, useContext } from 'react';
import { ScrollView, View, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LineChart, PieChart } from "react-native-chart-kit";
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TrendingUp, PieChart as PieIcon, Award, Leaf, BarChart3 } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = user?.role === 'admin';

  const fetchAnalytics = async () => {
    try {
      const endpoint = isAdmin ? '/analytics/admin-overview' : '/analytics/stats';
      const res = await apiClient.get(endpoint);
      setData(res.data);
    } catch (e) { 
      console.log("Analytics error:", e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useFocusEffect(useCallback(() => { fetchAnalytics(); }, [isAdmin]));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  // --- DATA PROCESSING WITH SAFETY GUARDS ---
  
  // 1. Line Chart Safety
  const trendSource = isAdmin ? (data?.cityTrend || []) : (data?.monthlyTrend || []);
  const hasTrendData = trendSource.length > 0;

  const lineData = {
    labels: hasTrendData ? trendSource.map(t => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months[(t._id?.month || 1) - 1];
    }) : ["None"],
    datasets: [{ data: hasTrendData ? trendSource.map(t => t.count || 0) : [0] }]
  };

  // 2. Pie Chart Safety
  const rawWasteStats = data?.wasteTypeStats || [];
  const hasWasteData = rawWasteStats.length > 0;

  const pieData = rawWasteStats.map((s, i) => ({
    name: (s._id || 'Other').toUpperCase(),
    population: s.count || 0,
    color: ['#15803d', '#2563eb', '#ca8a04', '#dc2626', '#0f172a'][i % 5],
    legendFontColor: "#64748b",
    legendFontSize: 10
  }));

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Header>
          <Title>{isAdmin ? "City Impact Hub" : "Your Eco Impact"}</Title>
          <Subtitle>REAL-TIME ENVIRONMENTAL INTELLIGENCE</Subtitle>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* SECTION 1: TRENDS */}
        <SectionHeader>
            <TrendingUp color="#15803d" size={20} />
            <SectionTitle>COLLECTION ACTIVITY</SectionTitle>
        </SectionHeader>
        <ChartCard>
            {hasTrendData ? (
                <LineChart
                    data={lineData}
                    width={width - 70}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            ) : (
                <NoDataBox>
                    <BarChart3 color="#cbd5e1" size={32} />
                    <NoDataText>Activity trends will appear after your first few missions.</NoDataText>
                </NoDataBox>
            )}
        </ChartCard>

        {/* SECTION 2: COMPOSITION */}
        <SectionHeader>
            <PieIcon color="#15803d" size={20} />
            <SectionTitle>WASTE SEGMENTATION</SectionTitle>
        </SectionHeader>
        <ChartCard>
            {hasWasteData ? (
                <PieChart
                    data={pieData}
                    width={width - 40}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                />
            ) : (
                <NoDataBox>
                    <PieIcon color="#cbd5e1" size={32} />
                    <NoDataText>Classification data is unavailable right now.</NoDataText>
                </NoDataBox>
            )}
        </ChartCard>

        {/* SECTION 3: MILESTONES */}
        <SectionHeader>
            <Award color="#15803d" size={20} />
            <SectionTitle>IMPACT MILESTONES</SectionTitle>
        </SectionHeader>
        <MilestoneCard>
            <Leaf color="#15803d" size={30} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <MilestoneTitle>System Verified</MilestoneTitle>
                <MilestoneSub>
                    {isAdmin 
                      ? `${data?.totals?.requests || 0} missions currently being managed across the city.` 
                      : `You have successfully coordinated ${data?.summary?.total || 0} waste pickups.`}
                </MilestoneSub>
            </View>
        </MilestoneCard>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Container>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  strokeWidth: 3,
  decimalPlaces: 0,
  useShadowColorFromDataset: false 
};

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const Header = styled.View` padding: 20px 25px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 24px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 10px; color: #15803d; font-weight: 800; letter-spacing: 1px; margin-top: 2px; `;
const SectionHeader = styled.View` flex-direction: row; align-items: center; margin-top: 25px; margin-bottom: 15px; gap: 10px; `;
const SectionTitle = styled.Text` font-size: 11px; font-weight: 900; color: #94a3b8; letter-spacing: 1.5px; `;
const ChartCard = styled.View` background: #fff; padding: 15px; border-radius: 24px; border: 1px solid #f1f5f9; elevation: 3; align-items: center; min-height: 200px; justify-content: center; `;
const MilestoneCard = styled.View` background: #f0fdf4; padding: 20px; border-radius: 20px; border: 1px solid #dcfce7; flex-direction: row; align-items: center; `;
const MilestoneTitle = styled.Text` font-size: 16px; font-weight: 800; color: #0f172a; `;
const MilestoneSub = styled.Text` font-size: 13px; color: #15803d; font-weight: 700; margin-top: 2px; `;
const NoDataBox = styled.View` align-items: center; padding: 20px; `;
const NoDataText = styled.Text` color: #cbd5e1; font-size: 12px; font-weight: 800; text-align: center; margin-top: 10px; padding: 0 20px; `;

export default AnalyticsScreen;