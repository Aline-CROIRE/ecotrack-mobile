import React, { useContext, useState, useCallback } from 'react';
import { ScrollView, StatusBar, View, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from "react-native-chart-kit"; // Chart Import
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Bell, Trash2, ArrowRight, User as UserIcon, 
  Map, Clock, MessageSquare, CheckCircle 
} from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isCollector = user?.role === 'collector';

  const fetchData = async () => {
    try {
      // Fetch both Notifications and Analytics in parallel
      const [notifyRes, statsRes] = await Promise.all([
        apiClient.get('/notifications'),
        apiClient.get('/analytics/stats')
      ]);
      
      setUnreadCount(notifyRes.data.data.filter(n => !n.read).length);
      setStats(statsRes.data);
    } catch (e) {
      console.log('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // Data formatting for the Chart
  const chartData = {
    labels: stats?.wasteTypeStats?.map(s => s._id.charAt(0).toUpperCase() + s._id.slice(1)) || ["None"],
    datasets: [{ data: stats?.wasteTypeStats?.map(s => s.count) || [0] }]
  };

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      
      <HeaderWrapper colors={['#064e3b', '#15803d']}>
        <TopRow>
          <UserSection>
            <AvatarWrapper><UserIcon color="#fff" size={20} /></AvatarWrapper>
            <View>
              <WelcomeText>{isCollector ? 'Collector Staff' : 'EcoTrack Member'}</WelcomeText>
              <UserName>{user?.name || 'User'}</UserName>
            </View>
          </UserSection>
          <IconButton onPress={() => navigation.navigate('Notifications')}>
            <Bell color="#fff" size={22} />
            {unreadCount > 0 && <RedDot />}
          </IconButton>
        </TopRow>

        <StatsContainer>
          <StatBox>
            <StatNum>{stats?.summary?.total || 0}</StatNum>
            <StatLabel>Total Pickups</StatLabel>
          </StatBox>
          <Divider />
          <StatBox>
            <StatNum>{isCollector ? '98%' : '4.8'}</StatNum>
            <StatLabel>{isCollector ? 'Efficiency' : 'Rating'}</StatLabel>
          </StatBox>
          <Divider />
          <StatBox>
            <StatNum>{stats?.wasteTypeStats?.length || 0}</StatNum>
            <StatLabel>Categories</StatLabel>
          </StatBox>
        </StatsContainer>
      </HeaderWrapper>

      <Content showsVerticalScrollIndicator={false}>
        <SectionHeader><SectionTitle>Operations</SectionTitle></SectionHeader>

        {isCollector ? (
          <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate('Requests')}>
            <LinearGradient colors={['#1e293b', '#334155']} style={CardStyle}>
              <IconCircle><Map color="#1e293b" size={24} /></IconCircle>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <ActionTitle>Daily Route</ActionTitle>
                <ActionSub>Navigate to assigned points</ActionSub>
              </View>
              <ArrowRight color="#fff" size={20} />
            </LinearGradient>
          </PrimaryActionCard>
        ) : (
          <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate('NewRequest')}>
            <LinearGradient colors={['#15803d', '#166534']} style={CardStyle}>
              <IconCircle><Trash2 color="#15803d" size={24} /></IconCircle>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <ActionTitle>Request Pickup</ActionTitle>
                <ActionSub>Instant scheduled collection</ActionSub>
              </View>
              <ArrowRight color="#fff" size={20} />
            </LinearGradient>
          </PrimaryActionCard>
        )}

        {/* CHART SECTION */}
        <SectionHeader><SectionTitle>Waste Distribution</SectionTitle></SectionHeader>
        <ChartWrapper>
          <BarChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(21, 128, 61, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
            }}
            verticalLabelRotation={0}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </ChartWrapper>

        <SectionHeader style={{ marginTop: 20 }}>
          <SectionTitle>Recent Activity</SectionTitle>
          <SeeAll onPress={() => navigation.navigate('Requests')}>See All</SeeAll>
        </SectionHeader>

        <ActivityCard>
          <StatusIndicator color="#15803d" />
          <ActivityInfo>
            <ActivityTitle>Cloud Sync</ActivityTitle>
            <ActivityDate>Real-time data active</ActivityDate>
          </ActivityInfo>
          <CheckCircle color="#15803d" size={20} />
        </ActivityCard>
      </Content>
    </Container>
  );
};

const CardStyle = { padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' };
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; background: #fff; `;
const Container = styled.View` flex: 1; background-color: #f8fafc; `;
const HeaderWrapper = styled(LinearGradient)` padding: 60px 20px 45px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; `;
const TopRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const UserSection = styled.View` flex-direction: row; align-items: center; `;
const AvatarWrapper = styled.View` width: 40px; height: 40px; border-radius: 20px; background: rgba(255,255,255,0.2); justify-content: center; align-items: center; margin-right: 12px; `;
const WelcomeText = styled.Text` color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 500; `;
const UserName = styled.Text` color: #fff; font-size: 20px; font-weight: bold; `;
const IconButton = styled.TouchableOpacity` background: rgba(255,255,255,0.15); padding: 10px; border-radius: 12px; `;
const RedDot = styled.View` position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; border-radius: 5px; background-color: #ef4444; border: 2px solid #15803d; `;
const StatsContainer = styled.View` flex-direction: row; background: #fff; border-radius: 20px; padding: 20px; justify-content: space-around; elevation: 10; shadow-opacity: 0.1; shadow-radius: 10px; `;
const StatBox = styled.View` align-items: center; `;
const StatNum = styled.Text` font-size: 18px; font-weight: bold; color: #0f172a; `;
const StatLabel = styled.Text` font-size: 11px; color: #64748b; margin-top: 4px; `;
const Divider = styled.View` width: 1px; height: 30px; background: #e2e8f0; align-self: center; `;
const Content = styled.ScrollView` flex: 1; padding: 25px 20px; `;
const SectionHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const SectionTitle = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const SeeAll = styled.Text` color: #15803d; font-weight: 700; font-size: 13px; `;
const PrimaryActionCard = styled.TouchableOpacity` margin-bottom: 15px; `;
const IconCircle = styled.View` width: 48px; height: 48px; border-radius: 24px; background: #fff; justify-content: center; align-items: center; `;
const ActionTitle = styled.Text` color: #fff; font-size: 17px; font-weight: 700; `;
const ActionSub = styled.Text` color: rgba(255,255,255,0.8); font-size: 12px; `;
const ChartWrapper = styled.View` background: #fff; border-radius: 20px; padding: 10px; border: 1px solid #f1f5f9; elevation: 2; `;
const ActivityCard = styled.View` background: #fff; border-radius: 16px; padding: 16px; flex-direction: row; align-items: center; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const StatusIndicator = styled.View` width: 4px; height: 35px; border-radius: 2px; background: #15803d; margin-right: 15px; `;
const ActivityInfo = styled.View` flex: 1; `;
const ActivityTitle = styled.Text` font-size: 15px; font-weight: 600; color: #1e293b; `;
const ActivityDate = styled.Text` font-size: 12px; color: #94a3b8; margin-top: 2px; `;

export default HomeScreen;