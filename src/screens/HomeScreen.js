import React, { useContext, useState, useCallback } from 'react';
import { 
  ScrollView, 
  StatusBar, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Bell, Trash2, ArrowRight, User as UserIcon, 
  Shield, Activity, Users, Map as MapIcon, 
  BarChart3, CheckCircle, MessageSquare, Navigation
} from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({ stats: null, recent: [], unreadCount: 0 });

  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  const loadMissionData = async () => {
    try {
      const statsEndpoint = isAdmin ? '/analytics/admin-overview' : '/analytics/stats';
      const [statsRes, notifyRes, recentRes] = await Promise.all([
        apiClient.get(statsEndpoint),
        apiClient.get('/notifications'),
        apiClient.get('/requests?limit=3')
      ]);

      setDashboardData({
        stats: statsRes.data,
        unreadCount: (notifyRes.data.data || []).filter(n => !n.read).length,
        recent: recentRes.data.data || []
      });
    } catch (e) {
      console.log('Sync Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadMissionData(); }, [user?.role]));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <Container>
      {/* 1. STATUS BAR: Set to dark so icons (Clock/Battery) are visible on white background */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
      {/* 2. TOP SAFE AREA: White background ensures a clean separation from phone system */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Content 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadMissionData();}} tintColor="#15803d" />}
      >
        {/* 3. PREMIUM HEADER: Now starts below the system bar */}
        <HeaderWrapper colors={['#064e3b', '#15803d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TopRow>
                <UserSection>
                    <AvatarWrapper isAdmin={isAdmin}>
                        {isAdmin ? <Shield color="#fff" size={22} /> : <UserIcon color="#fff" size={22} />}
                    </AvatarWrapper>
                    <View>
                        <WelcomeText>{isAdmin ? 'ADMINISTRATOR' : (isCollector ? 'STAFF' : 'MEMBER')}</WelcomeText>
                        <UserName numberOfLines={1}>{user?.name}</UserName>
                    </View>
                </UserSection>
                <IconButton onPress={() => navigation.navigate('Notifications')}>
                    <Bell color="#fff" size={24} />
                    {dashboardData.unreadCount > 0 && <RedDot />}
                </IconButton>
            </TopRow>

            <StatsContainer>
                <StatBox>
                    <StatNum>{isAdmin ? (dashboardData.stats?.totals?.requests || 0) : (dashboardData.stats?.summary?.total || 0)}</StatNum>
                    <StatLabel>Tasks</StatLabel>
                </StatBox>
                <Divider />
                <StatBox>
                    <StatNum>{isAdmin ? (dashboardData.stats?.totals?.users || 0) : '4.9'}</StatNum>
                    <StatLabel>Users</StatLabel>
                </StatBox>
                <Divider />
                <StatBox>
                    <StatNum>{isAdmin ? (dashboardData.stats?.heatmap?.length || 0) : (dashboardData.stats?.wasteTypeStats?.length || 0)}</StatNum>
                    <StatLabel>Pins</StatLabel>
                </StatBox>
            </StatsContainer>
        </HeaderWrapper>

        <BodySection>
            <SectionHeader><SectionTitle>Quick Commands</SectionTitle></SectionHeader>

            <ActionGrid>
                {isAdmin ? (
                    <LargeAction activeOpacity={0.9} onPress={() => navigation.navigate('AdminMap')}>
                        <LinearGradient colors={['#0f172a', '#1e293b']} style={ActionGradientStyle}>
                            <IconCircle><MapIcon color="#0f172a" size={24} /></IconCircle>
                            <View style={{flex: 1, marginLeft: 15}}><ActionTitle>City Heatmap</ActionTitle><ActionSub>Global monitoring</ActionSub></View>
                            <ArrowRight color="#fff" size={20} />
                        </LinearGradient>
                    </LargeAction>
                ) : isCollector ? (
                    <LargeAction activeOpacity={0.9} onPress={() => navigation.navigate('Map')}>
                        <LinearGradient colors={['#1e293b', '#334155']} style={ActionGradientStyle}>
                            <IconCircle><Navigation color="#1e293b" size={24} /></IconCircle>
                            <View style={{flex: 1, marginLeft: 15}}><ActionTitle>Mission Map</ActionTitle><ActionSub>Active navigation</ActionSub></View>
                            <ArrowRight color="#fff" size={20} />
                        </LinearGradient>
                    </LargeAction>
                ) : (
                    <LargeAction activeOpacity={0.9} onPress={() => navigation.navigate('NewRequest')}>
                        <LinearGradient colors={['#15803d', '#166534']} style={ActionGradientStyle}>
                            <IconCircle><Trash2 color="#15803d" size={24} /></IconCircle>
                            <View style={{flex: 1, marginLeft: 15}}><ActionTitle>New Request</ActionTitle><ActionSub>Schedule collection</ActionSub></View>
                            <ArrowRight color="#fff" size={20} />
                        </LinearGradient>
                    </LargeAction>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <SmallCard onPress={() => navigation.navigate('Inbox')}><MessageSquare color="#15803d" size={22} /><SmallLabel>Inbox</SmallLabel></SmallCard>
                    <SmallCard onPress={() => navigation.navigate(isAdmin ? 'CollectorPerformance' : 'Requests')}>
                        {isAdmin ? <BarChart3 color="#15803d" size={22} /> : <Activity color="#15803d" size={22} />}
                        <SmallLabel>{isAdmin ? 'Efficiency' : 'Logs'}</SmallLabel>
                    </SmallCard>
                </View>
            </ActionGrid>

            <SectionHeader><SectionTitle>Live Feed</SectionTitle><TouchableOpacity onPress={() => navigation.navigate('Requests')}><SeeAll>View All</SeeAll></TouchableOpacity></SectionHeader>

            {dashboardData.recent.map((item) => (
                <ActivityCard key={item._id} activeOpacity={0.8} onPress={() => navigation.navigate('RequestDetail', { item })}>
                    <StatusLine color={item?.status === 'completed' ? '#16a34a' : '#ca8a04'} />
                    <ActivityContent>
                        <ActivityTop><WasteTypeText>{(item?.wasteType || 'Waste').toUpperCase()}</WasteTypeText><ActivityTime>{new Date(item.createdAt).toLocaleDateString()}</ActivityTime></ActivityTop>
                        <ActivityAddress numberOfLines={1}>{item?.location?.address || 'Location Unpinned'}</ActivityAddress>
                    </ActivityContent>
                    <ArrowRight color="#cbd5e1" size={18} />
                </ActivityCard>
            ))}
        </BodySection>
        
        <View style={{ height: 40 }} />
      </Content>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const ActionGradientStyle = { padding: 22, borderRadius: 25, flexDirection: 'row', alignItems: 'center' };
const Container = styled.View` flex: 1; background-color: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; background: #fff; `;
const HeaderWrapper = styled(LinearGradient)` padding: 30px 20px 45px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; `;
const TopRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 25px; `;
const UserSection = styled.View` flex-direction: row; align-items: center; flex: 1; `;
const AvatarWrapper = styled.View` width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); justify-content: center; align-items: center; margin-right: 12px; border: 1px solid rgba(255,255,255,0.2); `;
const WelcomeText = styled.Text` color: rgba(255,255,255,0.7); font-size: 10px; font-weight: 800; `;
const UserName = styled.Text` color: #fff; font-size: 22px; font-weight: 900; `;
const IconButton = styled.TouchableOpacity` background: rgba(255,255,255,0.15); padding: 12px; border-radius: 15px; position: relative; `;
const RedDot = styled.View` position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; border-radius: 5px; background: #ef4444; border: 2px solid #15803d; `;
const StatsContainer = styled.View` flex-direction: row; background: #fff; border-radius: 25px; padding: 22px; justify-content: space-around; elevation: 15; shadow-opacity: 0.1; shadow-radius: 15px; shadow-color: #000; `;
const StatBox = styled.View` align-items: center; `;
const StatNum = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const StatLabel = styled.Text` font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px; `;
const Divider = styled.View` width: 1px; height: 35px; background: #f1f5f9; align-self: center; `;
const Content = styled.ScrollView` flex: 1; `;
const BodySection = styled.View` padding: 25px 20px; `;
const SectionHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 18px; `;
const SectionTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const SeeAll = styled.Text` color: #15803d; font-weight: 800; font-size: 13px; `;
const ActionGrid = styled.View` margin-bottom: 30px; `;
const LargeAction = styled.TouchableOpacity` margin-bottom: 12px; `;
const IconCircle = styled.View` width: 48px; height: 48px; border-radius: 24px; background: #fff; justify-content: center; align-items: center; `;
const ActionTitle = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;
const ActionSub = styled.Text` color: rgba(255,255,255,0.7); font-size: 12px; `;
const SmallCard = styled.TouchableOpacity` flex: 1; background: #fff; padding: 20px; border-radius: 22px; border: 1px solid #f1f5f9; align-items: center; gap: 8px; elevation: 3; `;
const SmallLabel = styled.Text` font-weight: 800; color: #1e293b; font-size: 12px; `;
const ActivityCard = styled.TouchableOpacity` background: #fff; border-radius: 18px; flex-direction: row; align-items: center; padding-right: 15px; margin-bottom: 12px; border: 1px solid #f1f5f9; overflow: hidden; `;
const StatusLine = styled.View` width: 5px; height: 60px; background: ${props => props.color}; `;
const ActivityContent = styled.View` flex: 1; padding: 15px; `;
const ActivityTop = styled.View` flex-direction: row; justify-content: space-between; `;
const WasteTypeText = styled.Text` font-size: 10px; font-weight: 900; color: #15803d; `;
const ActivityTime = styled.Text` font-size: 10px; color: #94a3b8; font-weight: 700; `;
const ActivityAddress = styled.Text` font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 4px; `;

export default HomeScreen;