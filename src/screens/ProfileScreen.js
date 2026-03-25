import React, { useContext } from 'react';
import { ScrollView, Alert, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { User as UserIcon, LogOut, ChevronRight, Settings, Bell, Shield, Info } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of EcoTrack?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <Header>
          <AvatarWrapper>
            <UserIcon color="#fff" size={40} />
          </AvatarWrapper>
          <UserName>{user?.name || 'Eco Member'}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <RoleBadge>
            <RoleText>{user?.role?.toUpperCase()}</RoleText>
          </RoleBadge>
        </Header>

        {/* ACCOUNT SECTION */}
        <Section>
          <SectionLabel>Account Settings</SectionLabel>
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#f0fdf4"><Settings color="#15803d" size={20} /></IconBox>
            <ItemLabel>Edit Profile</ItemLabel>
            <ChevronRight color="#cbd5e1" size={20} />
          </SettingsItem>
          
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#eff6ff"><Bell color="#2563eb" size={20} /></IconBox>
            <ItemLabel>Push Notifications</ItemLabel>
            <Switch value={true} trackColor={{ false: "#767577", true: "#15803d" }} />
          </SettingsItem>
        </Section>

        {/* SECURITY SECTION */}
        <Section>
          <SectionLabel>Security & Legal</SectionLabel>
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#fef2f2"><Shield color="#dc2626" size={20} /></IconBox>
            <ItemLabel>Privacy Policy</ItemLabel>
            <ChevronRight color="#cbd5e1" size={20} />
          </SettingsItem>
          
          <SettingsItem activeOpacity={0.7}>
            <IconBox bg="#f8fafc"><Info color="#64748b" size={20} /></IconBox>
            <ItemLabel>App Version</ItemLabel>
            <VersionText>v1.0.0</VersionText>
          </SettingsItem>
        </Section>

        {/* LOGOUT BUTTON */}
        <LogoutButton onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#dc2626" size={20} />
          <LogoutText>Sign Out</LogoutText>
        </LogoutButton>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM DARK EMERALD) ---
const Container = styled(SafeAreaView)` flex: 1; background: #f8fafc; `;
const Header = styled.View` align-items: center; padding: 40px 20px; background: #fff; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; margin-bottom: 20px; border: 1px solid #f1f5f9; `;
const AvatarWrapper = styled.View` width: 80px; height: 80px; border-radius: 40px; background: #15803d; justify-content: center; align-items: center; margin-bottom: 15px; elevation: 5; shadow-opacity: 0.2; shadow-radius: 10px; `;
const UserName = styled.Text` font-size: 22px; font-weight: 800; color: #0f172a; `;
const UserEmail = styled.Text` font-size: 14px; color: #64748b; margin-top: 4px; `;
const RoleBadge = styled.View` background: #f0fdf4; padding: 4px 12px; border-radius: 20px; border: 1px solid #15803d; margin-top: 12px; `;
const RoleText = styled.Text` color: #15803d; font-size: 10px; font-weight: 800; `;
const Section = styled.View` padding: 0 20px; margin-bottom: 25px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; margin-left: 5px; `;
const SettingsItem = styled.TouchableOpacity` flex-direction: row; align-items: center; background: #fff; padding: 15px; border-radius: 18px; margin-bottom: 10px; border: 1px solid #f1f5f9; `;
const IconBox = styled.View` width: 40px; height: 40px; border-radius: 12px; background: ${props => props.bg}; justify-content: center; align-items: center; margin-right: 15px; `;
const ItemLabel = styled.Text` flex: 1; font-size: 16px; font-weight: 700; color: #1e293b; `;
const VersionText = styled.Text` color: #94a3b8; font-weight: 600; font-size: 12px; `;
const LogoutButton = styled.TouchableOpacity` margin: 10px 20px 40px; flex-direction: row; align-items: center; justify-content: center; background: #fee2e2; padding: 20px; border-radius: 18px; gap: 10px; `;
const LogoutText = styled.Text` color: #dc2626; font-size: 16px; font-weight: 800; `;

export default ProfileScreen;