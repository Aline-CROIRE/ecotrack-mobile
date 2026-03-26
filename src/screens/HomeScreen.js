import React, { useContext, useState, useCallback } from 'react';
import { ScrollView, StatusBar, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Bell, Trash2, ArrowRight, User as UserIcon, 
  Shield, Activity, Users, Map as MapIcon, BarChart3, CheckCircle, MessageCircle 
} from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  /**
   * DATA FETCHING ENGINE
   * Dynamically switches endpoints based on User Role
   */
  const fetchData = async () => {
    try {
      // 1. Determine stats endpoint
      const statsEndpoint = isAdmin ? '/analytics/admin-overview' : '/analytics/stats';
      
      // 2. Fetch notifications and stats in parallel
      const [notifyRes, statsRes] = await Promise.all([
        apiClient.get('/notifications'),
        apiClient.get(statsEndpoint)
      ]);

      // 3. Update state
      const unread = (notifyRes.data.data || []).filter(n => !n.read).length;
      setUnreadCount(unread);
      setStats(statsRes.data);
    } catch (e) {
      console.log('Dashboard Sync Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [user.role]));

  if (loading) {
    return (
      <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      
      {/* --- HEADER SECTION --- */}
      <HeaderWrapper colors={['#064e3b', '#15803d']}>
        <TopRow>
          <UserSection>
            <AvatarWrapper>
                {isAdmin ? <Shield color="#fff" size={20} /> : <UserIcon color="#fff" size={20} />}
            </AvatarWrapper>
            <View>
              <WelcomeText>{isAdmin ? 'System Administrator' : (isCollector ? 'Staff Portal' : 'Eco Warrior')}</WelcomeText>
              <UserName numberOfLines={1}>{user?.name || 'User'}</UserName>
            </View>
          </UserSection>
          
          <IconButton onPress={() => navigation.navigate('Notifications')}>
            <Bell color="#fff" size={22} />
            {unreadCount > 0 ? <RedDot /> : null}
          </IconButton>
        </TopRow>

        {/* --- DYNAMIC STATS CARDS --- */}
        <StatsContainer>
          <StatBox>
            <StatNum>{isAdmin ? (stats?.totals?.requests || 0) : (stats?.summary?.total || 0)}</StatNum>
            <StatLabel>{isAdmin ? 'City Tasks' : 'Pickups'}</StatLabel>
          </StatBox>
          <Divider />
          <StatBox>
            <StatNum>{isAdmin ? (stats?.totals?.users || 0) : (isCollector ? '98%' : '4.9')}</StatNum>
            <StatLabel>{isAdmin ? 'Total Users' : (isCollector ? 'Efficiency' : 'Rating')}</StatLabel>
          </StatBox>
          <Divider />
          <StatBox>
            <StatNum>{isAdmin ? (stats?.heatmap?.length || 0) : (stats?.wasteTypeStats?.length || 0)}</StatNum>
            <StatLabel>{isAdmin ? 'Live Pins' : 'Categories'}</StatLabel>
          </StatBox>
        </StatsContainer>
      </HeaderWrapper>

      <Content showsVerticalScrollIndicator={false}>
        <SectionHeader>
            <SectionTitle>{isAdmin ? 'City Operations Hub' : 'Primary Actions'}</SectionTitle>
        </SectionHeader>

        {/* --- 1. ADMIN EXCLUSIVE COMMANDS --- */}
        {isAdmin ? (
          <View>
            <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate('AdminMap')}>
              <LinearGradient colors={['#0f172a', '#1e293b']} style={CardStyle}>
                <IconCircle><MapIcon color="#0f172a" size={24} /></IconCircle>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <ActionTitle>City Heatmap</ActionTitle>
                  <ActionSub>Monitor all global waste markers</ActionSub>
                </View>
                <ArrowRight color="#fff" size={20} />
              </LinearGradient>
            </PrimaryActionCard>

            <ActionGrid>
                <SmallCard onPress={() => navigation.navigate('ChatList')}>
                    <MessageCircle color="#15803d" size={22} />
                    <SmallLabel>Chat Inbox</SmallLabel>
                </SmallCard>
                <SmallCard onPress={() => navigation.navigate('CollectorPerformance')}>
                    <BarChart3 color="#15803d" size={22} />
                    <SmallLabel>Staff ROI</SmallLabel>
                </SmallCard>
            </ActionGrid>
          </View>
        ) : (
          /* --- 2. CITIZEN / COLLECTOR ACTIONS --- */
          <View>
            <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate(isCollector ? 'Map' : 'NewRequest')}>
                <LinearGradient colors={isCollector ? ['#1e293b', '#334155'] : ['#15803d', '#166534']} style={CardStyle}>
                    <IconCircle>
                        {isCollector ? <MapIcon color="#1e293b" size={24} /> : <Trash2 color="#15803d" size={24} />}
                    </IconCircle>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <ActionTitle>{isCollector ? 'Mission Map' : 'Request Pickup'}</ActionTitle>
                        <ActionSub>{isCollector ? 'Navigate to points' : 'Drop a GPS pin for collection'}</ActionSub>
                    </View>
                    <ArrowRight color="#fff" size={20} />
                </LinearGradient>
            </PrimaryActionCard>

            <ActionGrid>
                <SmallCard onPress={() => navigation.navigate('ChatList')}>
                    <MessageCircle color="#15803d" size={22} />
                    <SmallLabel>Messages</SmallLabel>
                </SmallCard>
                <SmallCard onPress={() => navigation.navigate('Requests')}>
                    <Activity color="#15803d" size={22} />
                    <SmallLabel>History</SmallLabel>
                </SmallCard>
            </ActionGrid>
          </View>
        )}

        <SectionHeader style={{ marginTop: 10 }}>
            <SectionTitle>Real-Time Integrity</SectionTitle>
        </SectionHeader>
        <ActivityCard>
          <StatusIndicator color="#15803d" />
          <ActivityInfo>
            <ActivityTitle>Secure Cloud Connection</ActivityTitle>
            <ActivityDate>Encrypted data flow: Active</ActivityDate>
          </ActivityInfo>
          <CheckCircle color="#15803d" size={20} />
        </ActivityCard>
      </Content>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM EMERALD) ---
const Container = styled.View` flex: 1; background-color: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; background: #fff; `;
const HeaderWrapper = styled(LinearGradient)` padding: 60px 20px 45px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; `;
const TopRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const UserSection = styled.View` flex-direction: row; align-items: center; flex: 1; `;
const AvatarWrapper = styled.View` width: 42px; height: 42px; border-radius: 21px; background: rgba(255,255,255,0.2); justify-content: center; align-items: center; margin-right: 12px; `;
const WelcomeText = styled.Text` color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 700; text-transform: uppercase; `;
const UserName = styled.Text` color: #fff; font-size: 20px; font-weight: 900; `;
const IconButton = styled.TouchableOpacity` background: rgba(255,255,255,0.15); padding: 10px; border-radius: 14px; position: relative; `;
const RedDot = styled.View` position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; border-radius: 6px; background-color: #ef4444; border: 2px solid #15803d; `;
const StatsContainer = styled.View` flex-direction: row; background: #fff; border-radius: 24px; padding: 22px; justify-content: space-around; elevation: 15; shadow-opacity: 0.1; shadow-radius: 15px; shadow-color: #000; `;
const StatBox = styled.View` align-items: center; `;
const StatNum = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const StatLabel = styled.Text` font-size: 10px; color: #94a3b8; font-weight: 700; margin-top: 4px; text-transform: uppercase; `;
const Divider = styled.View` width: 1px; height: 35px; background: #f1f5f9; align-self: center; `;
const Content = styled.ScrollView` flex: 1; padding: 25px 20px; `;
const SectionHeader = styled.View` margin-bottom: 18px; `;
const SectionTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const PrimaryActionCard = styled.TouchableOpacity` margin-bottom: 15px; `;
const CardStyle = { padding: 22, borderRadius: 24, flexDirection: 'row', alignItems: 'center' };
const IconCircle = styled.View` width: 50px; height: 50px; border-radius: 25px; background: #fff; justify-content: center; align-items: center; `;
const ActionTitle = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;
const ActionSub = styled.Text` color: rgba(255,255,255,0.8); font-size: 12px; `;
const ActionGrid = styled.View` flexDirection: row; gap: 12px; marginBottom: 25px; `;
const SmallCard = styled.TouchableOpacity` flex: 1; background: #fff; padding: 20px; border-radius: 22px; border: 1px solid #f1f5f9; align-items: center; gap: 8px; elevation: 3; shadow-opacity: 0.05; shadow-radius: 5px; `;
const SmallLabel = styled.Text` font-weight: 800; color: #1e293b; font-size: 12px; `;
const ActivityCard = styled.View` background: #fff; border-radius: 20px; padding: 18px; flex-direction: row; align-items: center; margin-bottom: 40px; border: 1px solid #f1f5f9; `;
const StatusIndicator = styled.View` width: 4px; height: 40px; border-radius: 2px; background: #15803d; margin-right: 15px; `;
const ActivityInfo = styled.View` flex: 1; `;
const ActivityTitle = styled.Text` font-size: 15px; font-weight: 700; color: #1e293b; `;
const ActivityDate = styled.Text` font-size: 12px; color: #94a3b8; margin-top: 2px; `;

export default HomeScreen;