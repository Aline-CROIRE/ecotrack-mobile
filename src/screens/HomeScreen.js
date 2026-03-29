import React, { useContext, useState, useCallback } from 'react';
import { ScrollView, StatusBar, View, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';
import { 
  Bell, Trash2, ArrowRight, User as UserIcon, 
  Shield, Activity, Users, Map as MapIcon, 
  BarChart3, CheckCircle, MessageCircle, AlertTriangle 
} from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ stats: null, unread: 0, recent: [] });

  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  const loadData = async () => {
    try {
      const statsEnd = isAdmin ? '/analytics/admin-overview' : '/analytics/stats';
      const [sRes, nRes, rRes] = await Promise.all([
        apiClient.get(statsEnd),
        apiClient.get('/notifications'),
        apiClient.get('/requests?limit=3')
      ]);
      setData({
        stats: sRes.data,
        unread: (nRes.data.data || []).filter(n => !n.read).length,
        recent: rRes.data.data || []
      });
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user?.role]));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Content 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} />}
      >
        <HeaderWrapper colors={['#064e3b', '#15803d']}>
            <TopRow>
                <UserSection>
                    <AvatarWrapper>{isAdmin ? <Shield color="#fff" size={22} /> : <UserIcon color="#fff" size={22} />}</AvatarWrapper>
                    <View>
                        <WelcomeText>{isAdmin ? 'SYSTEM ADMIN' : (isCollector ? 'FIELD STAFF' : 'CITIZEN')}</WelcomeText>
                        <UserName numberOfLines={1}>{user?.name}</UserName>
                    </View>
                </UserSection>
                <IconButton onPress={() => navigation.navigate('Notifications')}>
                    <Bell color="#fff" size={24} />
                    {data.unread > 0 && <RedDot />}
                </IconButton>
            </TopRow>

            <StatsContainer>
                <StatBox><StatNum>{isAdmin ? data.stats?.totals?.requests : (data.stats?.summary?.total || 0)}</StatNum><StatLabel>Tasks</StatLabel></StatBox>
                <Divider />
                <StatBox><StatNum>{isAdmin ? data.stats?.totals?.users : '4.9'}</StatNum><StatLabel>Users</StatLabel></StatBox>
                <Divider />
                <StatBox><StatNum>{isAdmin ? data.stats?.heatmap?.length : (data.stats?.wasteTypeStats?.length || 0)}</StatNum><StatLabel>Pins</StatLabel></StatBox>
            </StatsContainer>
        </HeaderWrapper>

        <BodySection>
            <SectionTitle>Command Center</SectionTitle>
            
            {/* ADMIN GRID: HEATMAP + INBOX + ROI + REPORTS */}
            {isAdmin ? (
                <View>
                    <PrimaryAction onPress={() => navigation.navigate('AdminMap')}>
                        <LinearGradient colors={['#0f172a', '#1e293b']} style={CardStyle}>
                            <IconCircle><MapIcon color="#0f172a" size={24} /></IconCircle>
                            <View style={{flex: 1, marginLeft: 15}}><ActionTitle>Live Heatmap</ActionTitle><ActionSub>Global monitoring</ActionSub></View>
                            <ArrowRight color="#fff" size={20} />
                        </LinearGradient>
                    </PrimaryAction>

                    <ActionGrid>
                        <SmallCard onPress={() => navigation.navigate('Reports')}>
                            <IconCircleSmall bg="#fef2f2"><AlertTriangle color="#dc2626" size={20} /></IconCircleSmall>
                            <SmallLabel>City Reports</SmallLabel>
                        </SmallCard>
                        <SmallCard onPress={() => navigation.navigate('CollectorPerformance')}>
                            <IconCircleSmall bg="#f0fdf4"><BarChart3 color="#15803d" size={20} /></IconCircleSmall>
                            <SmallLabel>Staff ROI</SmallLabel>
                        </SmallCard>
                    </ActionGrid>
                </View>
            ) : (
                /* CITIZEN/COLLECTOR ACTIONS */
                <View>
                    <PrimaryAction onPress={() => navigation.navigate(isCollector ? 'Map' : 'NewRequest')}>
                        <LinearGradient colors={['#15803d', '#166534']} style={CardStyle}>
                            <IconCircle>{isCollector ? <MapIcon color="#15803d" size={24} /> : <Trash2 color="#15803d" size={24} />}</IconCircle>
                            <View style={{flex: 1, marginLeft: 15}}><ActionTitle>{isCollector ? 'Start Route' : 'Request Pickup'}</ActionTitle><ActionSub>Active GPS monitoring</ActionSub></View>
                            <ArrowRight color="#fff" size={20} />
                        </LinearGradient>
                    </PrimaryAction>
                    <ActionGrid>
                        <SmallCard onPress={() => navigation.navigate('Inbox')}><IconCircleSmall bg="#f8fafc"><MessageCircle color="#15803d" size={20} /></IconCircleSmall><SmallLabel>Messages</SmallLabel></SmallCard>
                        <SmallCard onPress={() => navigation.navigate('Reports')}><IconCircleSmall bg="#fef2f2"><AlertTriangle color="#dc2626" size={20} /></IconCircleSmall><SmallLabel>Reports</SmallLabel></SmallCard>
                    </ActionGrid>
                </View>
            )}

            <SectionHeader><SectionTitle>Live Operations</SectionTitle><TouchableOpacity onPress={() => navigation.navigate('Activity')}><SeeAll>See All</SeeAll></TouchableOpacity></SectionHeader>
            {data.recent.map((item) => (
                <ActivityCard key={item._id} onPress={() => navigation.navigate('RequestDetail', { item })}>
                    <StatusLine color={item?.status === 'completed' ? '#16a34a' : '#ca8a04'} />
                    <ActivityBody><WasteText>{(item?.wasteType || 'Waste').toUpperCase()}</WasteText><AddrText numberOfLines={1}>{item?.location?.address}</AddrText></ActivityBody>
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
const CardStyle = { padding: 22, borderRadius: 24, flexDirection: 'row', alignItems: 'center' };
const Container = styled.View` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; background: #fff; `;
const HeaderWrapper = styled(LinearGradient)` padding: 30px 20px 45px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; `;
const TopRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 25px; `;
const UserSection = styled.View` flex-direction: row; align-items: center; flex: 1; `;
const AvatarWrapper = styled.View` width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.15); justify-content: center; align-items: center; margin-right: 12px; `;
const WelcomeText = styled.Text` color: rgba(255,255,255,0.7); font-size: 10px; font-weight: 800; `;
const UserName = styled.Text` color: #fff; font-size: 22px; font-weight: 900; `;
const IconButton = styled.TouchableOpacity` background: rgba(255,255,255,0.15); padding: 12px; border-radius: 15px; position: relative; `;
const RedDot = styled.View` position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; border-radius: 5px; background: #ef4444; border: 2px solid #15803d; `;
const StatsContainer = styled.View` flex-direction: row; background: #fff; border-radius: 25px; padding: 22px; justify-content: space-around; elevation: 15; shadow-opacity: 0.1; shadow-radius: 15px; shadow-color: #000; `;
const StatBox = styled.View` align-items: center; `;
const StatNum = styled.Text` font-size: 19px; font-weight: 900; color: #0f172a; `;
const StatLabel = styled.Text` font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px; `;
const Divider = styled.View` width: 1px; height: 35px; background: #f1f5f9; align-self: center; `;
const Content = styled.ScrollView` flex: 1; `;
const BodySection = styled.View` padding: 25px 20px; `;
const SectionHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 15px; `;
const SectionTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const SeeAll = styled.Text` color: #15803d; font-weight: 800; font-size: 13px; `;
const ActionGrid = styled.View` flex-direction: row; gap: 12px; margin-bottom: 25px; `;
const PrimaryAction = styled.TouchableOpacity` margin-bottom: 15px; `;
const IconCircle = styled.View` width: 48px; height: 48px; border-radius: 24px; background: #fff; justify-content: center; align-items: center; `;
const ActionTitle = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;
const ActionSub = styled.Text` color: rgba(255,255,255,0.7); font-size: 12px; `;
const SmallCard = styled.TouchableOpacity` flex: 1; background: #fff; padding: 20px; border-radius: 22px; border: 1px solid #f1f5f9; align-items: center; gap: 8px; elevation: 3; `;
const IconCircleSmall = styled.View` width: 40px; height: 40px; border-radius: 20px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const SmallLabel = styled.Text` font-weight: 800; color: #1e293b; font-size: 11px; `;
const ActivityCard = styled.TouchableOpacity` background: #fff; border-radius: 18px; flex-direction: row; align-items: center; padding-right: 15px; margin-bottom: 12px; border: 1px solid #f1f5f9; overflow: hidden; `;
const StatusLine = styled.View` width: 5px; height: 60px; background: ${props => props.color}; `;
const ActivityBody = styled.View` flex: 1; padding: 15px; `;
const WasteText = styled.Text` font-size: 10px; font-weight: 900; color: #15803d; `;
const AddrText = styled.Text` font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px; `;

export default HomeScreen;
