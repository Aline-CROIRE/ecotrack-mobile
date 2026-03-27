import React, { useContext } from 'react';
import { 
  ScrollView, Alert, View, Switch, 
  StatusBar, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { 
  User, LogOut, ChevronRight, Settings, 
  Bell, Users, BarChart3, ShieldCheck, 
  Globe, Info, Lock, LifeBuoy, FileText
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  // 1. HOOKS
  const { logout, user } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  // 2. LOGOUT SAFETY GUARD
  if (!user) return null;

  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    const langNames = { en: 'English', rw: 'Kinyarwanda', fr: 'Français' };
    Alert.alert(t('success'), `Language set to ${langNames[langCode]}`);
  };

  const showLanguagePicker = () => {
    Alert.alert(
      t('language'),
      'Select your preferred language / Hitamo ururimi / Choisissez votre langue',
      [
        { text: 'Kinyarwanda', onPress: () => handleLanguageChange('rw') },
        { text: 'Français', onPress: () => handleLanguageChange('fr') },
        { text: 'English', onPress: () => handleLanguageChange('en') },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* IDENTITY HEADER */}
        <Header>
          <AvatarGlow isAdmin={isAdmin}>
            <AvatarInner isAdmin={isAdmin}>
                {isAdmin ? <ShieldCheck color="#fff" size={40} /> : <User color="#fff" size={40} />}
            </AvatarInner>
            <LiveStatusIndicator />
          </AvatarGlow>
          
          <UserName>{user?.name || 'Eco Member'}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          
          <RolePill isAdmin={isAdmin}>
            <RoleText isAdmin={isAdmin}>
                {isAdmin ? t('admin') : (isCollector ? t('collector') : t('citizen'))}
            </RoleText>
          </RolePill>
        </Header>

        <BodySection>
            
            {/* LANGUAGE */}
            <Section>
                <SectionLabel>{t('language').toUpperCase()}</SectionLabel>
                <SettingsLink onPress={showLanguagePicker}>
                    <SmallIcon bg="#f0fdf4"><Globe color="#15803d" size={20} /></SmallIcon>
                    <LinkText>{i18n.language.toUpperCase()} - Change Language</LinkText>
                    <ChevronRight color="#cbd5e1" size={18} />
                </SettingsLink>
            </Section>

            {/* ADMIN MANAGEMENT */}
            {isAdmin && (
                <Section>
                    <SectionLabel>SYSTEM MANAGEMENT</SectionLabel>
                    <AdminGrid>
                        <GridCard onPress={() => navigation.navigate('CollectorPerformance')}>
                            <IconCircle bg="#fff1f2"><BarChart3 color="#e11d48" size={24} /></IconCircle>
                            <GridCardLabel>Personnel ROI</GridCardLabel>
                        </GridCard>
                        <GridCard onPress={() => navigation.navigate('Inbox')}>
                            <IconCircle bg="#f0fdf4"><Users color="#15803d" size={24} /></IconCircle>
                            <GridCardLabel>Directory</GridCardLabel>
                        </GridCard>
                    </AdminGrid>
                </Section>
            )}

            {/* PERSONAL ACCOUNT */}
            <Section>
                <SectionLabel>YOUR ACCOUNT</SectionLabel>
                <SettingsLink onPress={() => navigation.navigate('EditProfile')}>
                    <SmallIcon bg="#f8fafc"><Settings color="#64748b" size={20} /></SmallIcon>
                    <LinkText>Update Personal Info</LinkText>
                    <ChevronRight color="#cbd5e1" size={18} />
                </SettingsLink>
                
                <SettingsLink activeOpacity={0.7}>
                    <SmallIcon bg="#eff6ff"><Bell color="#2563eb" size={20} /></SmallIcon>
                    <LinkText>Notification Alerts</LinkText>
                    <Switch value={true} trackColor={{ true: "#15803d" }} />
                </SettingsLink>
            </Section>

            {/* HELP & SUPPORT */}
            <Section>
                <SectionLabel>SUPPORT & LEGAL</SectionLabel>
                <SettingsLink onPress={() => navigation.navigate('Support')}>
                    <SmallIcon bg="#fdf4ff"><LifeBuoy color="#a21caf" size={20} /></SmallIcon>
                    <LinkText>Help & Support Center</LinkText>
                    <ChevronRight color="#cbd5e1" size={18} />
                </SettingsLink>
                
                <SettingsLink onPress={() => navigation.navigate('Legal')}>
                    <SmallIcon bg="#f8fafc"><FileText color="#64748b" size={20} /></SmallIcon>
                    <LinkText>Terms & Privacy</LinkText>
                    <ChevronRight color="#cbd5e1" size={18} />
                </SettingsLink>
            </Section>

            {/* SIGN OUT */}
            <LogoutButton onPress={() => Alert.alert(t('logout'), 'Exit your current session?', [{text: 'Cancel', style:'cancel'}, {text: 'LOGOUT', onPress: logout}])}>
                <LogOut color="#dc2626" size={20} />
                <LogoutBtnText>SIGN OUT </LogoutBtnText>
            </LogoutButton>

           

        </BodySection>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (ALL DEFINED AND MATCHED) ---

const Container = styled.View` flex: 1; background: #ffffff; `;

const Header = styled.View` 
  align-items: center; padding: 40px 20px; background: #fff; 
  border-bottom-width: 1px; border-bottom-color: #f1f5f9; 
`;

const AvatarGlow = styled.View` 
  padding: 4px; border-radius: 50px; border: 3px solid ${props => props.isAdmin ? '#0f172a' : '#15803d'}; 
  margin-bottom: 15px; position: relative;
`;

const AvatarInner = styled.View` 
  width: 86px; height: 86px; border-radius: 43px; 
  background: ${props => props.isAdmin ? '#0f172a' : '#15803d'}; 
  justify-content: center; align-items: center; elevation: 10;
`;

const LiveStatusIndicator = styled.View` 
  position: absolute; bottom: 5px; right: 5px; width: 18px; height: 18px; 
  border-radius: 9px; background-color: #16a34a; border: 3px solid #fff; 
`;

const UserName = styled.Text` font-size: 24px; font-weight: 900; color: #0f172a; `;
const UserEmail = styled.Text` font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 4px; `;

const RolePill = styled.View` 
  background: ${props => props.isAdmin ? '#0f172a' : '#f0fdf4'}; 
  padding: 8px 18px; border-radius: 20px; margin-top: 15px; 
`;

const RoleText = styled.Text` 
  color: ${props => props.isAdmin ? '#fff' : '#15803d'}; 
  font-size: 9px; font-weight: 900; letter-spacing: 1px; 
`;

const BodySection = styled.View` padding: 25px 20px; background: #f8fafc; flex: 1; `;

const Section = styled.View` margin-bottom: 30px; `;

const SectionLabel = styled.Text` 
  font-size: 11px; font-weight: 900; color: #cbd5e1; 
  text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1.5px;
`;

const AdminGrid = styled.View` flex-direction: row; gap: 12px; `;

const GridCard = styled.TouchableOpacity` 
  flex: 1; background: #fff; border-radius: 24px; padding: 22px; 
  border: 1px solid #f1f5f9; elevation: 4; align-items: center; 
`;

const IconCircle = styled.View` 
  width: 50px; height: 50px; border-radius: 14px; 
  background: ${props => props.bg}; justify-content: center; align-items: center; 
  margin-bottom: 12px; 
`;

const GridCardLabel = styled.Text` font-size: 12px; font-weight: 800; color: #1e293b; `;

const SettingsLink = styled.TouchableOpacity` 
  flex-direction: row; align-items: center; background: #fff; 
  padding: 16px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; 
`;

const SmallIcon = styled.View` 
  width: 38px; height: 38px; border-radius: 19px; 
  background: ${props => props.bg}; justify-content: center; align-items: center; 
  margin-right: 15px; 
`;

const LinkText = styled.Text` flex: 1; font-size: 15px; font-weight: 700; color: #1e293b; `;

const LogoutButton = styled.TouchableOpacity` 
  flex-direction: row; align-items: center; justify-content: center; 
  background: #fee2e2; padding: 20px; border-radius: 20px; gap: 10px; margin-top: 10px;
`;

const LogoutBtnText = styled.Text` color: #dc2626; font-size: 15px; font-weight: 900; `;

const FooterContainer = styled.View` align-items: center; margin-top: 20px; margin-bottom: 50px; `;

const VersionText = styled.Text` font-size: 10px; font-weight: 800; color: #cbd5e1; margin-bottom: 4px; `;

export default ProfileScreen;