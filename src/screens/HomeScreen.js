import React, { useContext } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Bell, Trash2, ArrowRight, User as UserIcon, Clock, LayoutDashboard } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const isCollector = user?.role === 'collector';

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      
      <HeaderWrapper colors={['#064e3b', '#15803d']}>
        <TopRow>
          <UserSection>
            <AvatarWrapper><UserIcon color="#fff" size={20} /></AvatarWrapper>
            <View>
              <WelcomeText>{isCollector ? 'Staff Portal' : 'EcoTrack Member'}</WelcomeText>
              <UserName>{user?.name || 'User'}</UserName>
            </View>
          </UserSection>
          <IconButton><Bell color="#fff" size={22} /></IconButton>
        </TopRow>

        <StatsContainer>
          <StatBox><StatNum>14</StatNum><StatLabel>Pickups</StatLabel></StatBox>
          <Divider /><StatBox><StatNum>4.9</StatNum><StatLabel>Rating</StatLabel></StatBox>
          <Divider /><StatBox><StatNum>12kg</StatNum><StatLabel>Recycled</StatLabel></StatBox>
        </StatsContainer>
      </HeaderWrapper>

      <Content showsVerticalScrollIndicator={false}>
        <SectionHeader>
          <SectionTitle>Quick Actions</SectionTitle>
        </SectionHeader>

        {/* 1. PRIMARY ACTION (CITIZEN: NEW REQUEST | COLLECTOR: VIEW TASKS) */}
        {isCollector ? (
          <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate('Requests')}>
            <LinearGradient colors={['#1e293b', '#334155']} style={CardStyle}>
              <IconCircle><LayoutDashboard color="#1e293b" size={24} /></IconCircle>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <ActionTitle>View Assigned Tasks</ActionTitle>
                <ActionSub>Manage your collection route</ActionSub>
              </View>
              <ArrowRight color="#fff" size={20} />
            </LinearGradient>
          </PrimaryActionCard>
        ) : (
          <View>
            <PrimaryActionCard activeOpacity={0.9} onPress={() => navigation.navigate('NewRequest')}>
              <LinearGradient colors={['#15803d', '#166534']} style={CardStyle}>
                <IconCircle><Trash2 color="#15803d" size={24} /></IconCircle>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <ActionTitle>Request Waste Pickup</ActionTitle>
                  <ActionSub>Instant scheduled collection</ActionSub>
                </View>
                <ArrowRight color="#fff" size={20} />
              </LinearGradient>
            </PrimaryActionCard>

            {/* NEW: Secondary Action for Citizens to see their List */}
            <SecondaryActionRow>
               <SmallActionCard onPress={() => navigation.navigate('Requests')}>
                  <Clock color="#15803d" size={20} />
                  <SmallActionLabel>View History</SmallActionLabel>
               </SmallActionCard>
            </SecondaryActionRow>
          </View>
        )}

        <SectionHeader>
          <SectionTitle>Recent Activity</SectionTitle>
          {/* 2. SEE ALL BUTTON - Navigates to the Requests Tab */}
          <SeeAllLink onPress={() => navigation.navigate('Requests')}>
            <SeeAllText>See All</SeeAllText>
          </SeeAllLink>
        </SectionHeader>

        {/* ... (Activity Cards below) */}
        <ActivityCard>
            <StatusIndicator color="#16a34a" />
            <ActivityInfo>
                <ActivityTitle>Latest Request</ActivityTitle>
                <ActivityDate>Click "See All" to view full history</ActivityDate>
            </ActivityInfo>
        </ActivityCard>

      </Content>
    </Container>
  );
};

const CardStyle = { padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' };

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background-color: #f8fafc; `;
const HeaderWrapper = styled(LinearGradient)` padding: 60px 20px 45px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; `;
const TopRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 30px; `;
const UserSection = styled.View` flex-direction: row; align-items: center; `;
const AvatarWrapper = styled.View` width: 40px; height: 40px; border-radius: 20px; background: rgba(255,255,255,0.2); justify-content: center; align-items: center; margin-right: 12px; `;
const WelcomeText = styled.Text` color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 500; `;
const UserName = styled.Text` color: #fff; font-size: 20px; font-weight: bold; `;
const IconButton = styled.TouchableOpacity` background: rgba(255,255,255,0.15); padding: 10px; border-radius: 12px; `;
const StatsContainer = styled.View` flex-direction: row; background: #fff; border-radius: 20px; padding: 20px; justify-content: space-around; elevation: 10; shadow-opacity: 0.1; shadow-radius: 10px; `;
const StatBox = styled.View` align-items: center; `;
const StatNum = styled.Text` font-size: 18px; font-weight: bold; color: #0f172a; `;
const StatLabel = styled.Text` font-size: 11px; color: #64748b; margin-top: 4px; `;
const Divider = styled.View` width: 1px; height: 30px; background: #e2e8f0; align-self: center; `;
const Content = styled.ScrollView` flex: 1; padding: 25px 20px; `;
const SectionHeader = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const SectionTitle = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const SeeAllLink = styled.TouchableOpacity``;
const SeeAllText = styled.Text` color: #15803d; font-weight: 700; font-size: 14px; `;
const PrimaryActionCard = styled.TouchableOpacity` margin-bottom: 15px; `;
const IconCircle = styled.View` width: 48px; height: 48px; border-radius: 24px; background: #fff; justify-content: center; align-items: center; `;
const ActionTitle = styled.Text` color: #fff; font-size: 17px; font-weight: 700; `;
const ActionSub = styled.Text` color: rgba(255,255,255,0.8); font-size: 12px; `;
const SecondaryActionRow = styled.View` flex-direction: row; gap: 12px; margin-bottom: 25px; `;
const SmallActionCard = styled.TouchableOpacity` flex: 1; background: #fff; padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0; flex-direction: row; align-items: center; justify-content: center; gap: 10px; `;
const SmallActionLabel = styled.Text` font-weight: 700; color: #1e293b; `;
const ActivityCard = styled.View` background: #fff; border-radius: 16px; padding: 16px; flex-direction: row; align-items: center; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const StatusIndicator = styled.View` width: 4px; height: 35px; border-radius: 2px; background: ${props => props.color}; margin-right: 15px; `;
const ActivityInfo = styled.View` flex: 1; `;
const ActivityTitle = styled.Text` font-size: 15px; font-weight: 600; color: #1e293b; `;
const ActivityDate = styled.Text` font-size: 12px; color: #94a3b8; margin-top: 2px; `;

export default HomeScreen;