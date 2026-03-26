import React, { useContext } from 'react';
import { ScrollView, Alert, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Shield, LogOut, ChevronRight, Settings, Bell, Users, BarChart3 } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);

  /**
   * 1. CRITICAL GUARD CLAUSE
   * If the user is null (during logout), we return null to stop rendering.
   * This prevents the "property of null" crash.
   */
  if (!user) return null;

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    Alert.alert(
      'System Logout',
      'Are you sure you want to end your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            // Ensure any navigation or logic is handled before clearing state
            await logout();
          } 
        }
      ]
    );
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <AvatarWrapper isAdmin={isAdmin}>
            {isAdmin ? <Shield color="#fff" size={40} /> : <Users color="#fff" size={40} />}
          </AvatarWrapper>
          
          {/* 2. OPTIONAL CHAINING (user?.name) */}
          <UserName>{user?.name || 'Eco Member'}</UserName>
          <UserEmail>{user?.email || 'No email provided'}</UserEmail>
          
          <RoleBadge isAdmin={isAdmin}>
            <RoleText isAdmin={isAdmin}>
              {(user?.role || 'member').toUpperCase()} MODE
            </RoleText>
          </RoleBadge>
        </Header>

        {/* ADMIN SYSTEM MANAGEMENT */}
        {isAdmin && (
            <Section>
                <SectionLabel>System Management</SectionLabel>
                <SettingsItem onPress={() => navigation.navigate('CollectorPerformance')}>
                    <IconBox bg="#fff1f2"><BarChart3 color="#e11d48" size={20} /></IconBox>
                    <ItemLabel>Staff Efficiency Logs</ItemLabel>
                    <ChevronRight color="#cbd5e1" size={20} />
                </SettingsItem>
                <SettingsItem onPress={() => navigation.navigate('ChatList')}>
                    <IconBox bg="#f0fdf4"><Users color="#15803d" size={20} /></IconBox>
                    <ItemLabel>Full User Directory</ItemLabel>
                    <ChevronRight color="#cbd5e1" size={20} />
                </SettingsItem>
            </Section>
        )}

        <Section>
          <SectionLabel>Application Settings</SectionLabel>
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#f8fafc"><Settings color="#64748b" size={20} /></IconBox>
            <ItemLabel>Edit Profile Info</ItemLabel>
            <ChevronRight color="#cbd5e1" size={20} />
          </SettingsItem>
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#eff6ff"><Bell color="#2563eb" size={20} /></IconBox>
            <ItemLabel>Push Notifications</ItemLabel>
            <Switch value={true} trackColor={{ true: "#15803d" }} />
          </SettingsItem>
        </Section>

        <LogoutButton onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#dc2626" size={20} />
          <LogoutText>Sign Out of System</LogoutText>
        </LogoutButton>

        <VersionContainer>
            <VersionText>EcoTrack Build v1.0.4 • Production</VersionText>
        </VersionContainer>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM DARK EMERALD) ---
const Container = styled(SafeAreaView)` flex: 1; background: #f8fafc; `;
const Header = styled.View` align-items: center; padding: 40px 20px; background: #fff; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; margin-bottom: 25px; border-width: 1px; border-color: #f1f5f9; elevation: 2; `;
const AvatarWrapper = styled.View` width: 80px; height: 80px; border-radius: 40px; background: ${props => props.isAdmin ? '#0f172a' : '#15803d'}; justify-content: center; align-items: center; margin-bottom: 15px; elevation: 5; shadow-opacity: 0.1; shadow-radius: 10px; `;
const UserName = styled.Text` font-size: 22px; font-weight: 900; color: #0f172a; `;
const UserEmail = styled.Text` font-size: 14px; color: #64748b; margin-top: 5px; `;
const RoleBadge = styled.View` background: ${props => props.isAdmin ? '#0f172a' : '#f0fdf4'}; padding: 6px 16px; border-radius: 20px; margin-top: 15px; border-width: 1px; border-color: ${props => props.isAdmin ? '#0f172a' : '#15803d'}; `;
const RoleText = styled.Text` color: ${props => props.isAdmin ? '#fff' : '#15803d'}; font-size: 10px; font-weight: 900; letter-spacing: 1px; `;
const Section = styled.View` padding: 0 20px; margin-bottom: 25px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; margin-left: 5px; `;
const SettingsItem = styled.TouchableOpacity` flex-direction: row; align-items: center; background: #fff; padding: 15px; border-radius: 18px; margin-bottom: 10px; border: 1px solid #f1f5f9; `;
const IconBox = styled.View` width: 40px; height: 40px; border-radius: 12px; background: ${props => props.bg}; justify-content: center; align-items: center; margin-right: 15px; `;
const ItemLabel = styled.Text` flex: 1; font-size: 15px; font-weight: 700; color: #1e293b; `;
const LogoutButton = styled.TouchableOpacity` margin: 10px 20px 20px; flex-direction: row; align-items: center; justify-content: center; background: #fee2e2; padding: 20px; border-radius: 18px; gap: 10px; `;
const LogoutText = styled.Text` color: #dc2626; font-size: 16px; font-weight: 800; `;
const VersionContainer = styled.View` align-items: center; margin-bottom: 40px; `;
const VersionText = styled.Text` font-size: 11px; color: #cbd5e1; font-weight: 700; `;

export default ProfileScreen;