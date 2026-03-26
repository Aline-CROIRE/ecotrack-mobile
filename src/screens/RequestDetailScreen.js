import React, { useState, useContext } from 'react';
import { 
  ScrollView, Image, Linking, Alert, 
  ActivityIndicator, View, TouchableOpacity, Platform, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, Phone, Calendar, ChevronLeft, 
  User as UserIcon, Navigation as NavIcon, 
  MessageCircle, CheckCircle2, Clock, ShieldCheck, 
  Settings, Star, AlertCircle, Users // FIXED: Added Users import here
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import RatingModal from '../components/RatingModal';

const RequestDetailScreen = ({ route, navigation }) => {
  const { item } = route.params || {};
  const { user } = useContext(AuthContext);

  const [status, setStatus] = useState(item?.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);

  if (!item) return null;

  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';
  const isMeCitizen = item.citizen?._id === user?._id;
  const isMeCollector = item.collector?._id === user?._id;
  const hasCoords = item?.location?.coordinates && item.location.coordinates[0] !== 0;

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/requests/${item._id}/status`, { status: newStatus });
      setStatus(newStatus);
      setLoading(false);
      Alert.alert('Mission Update', `Status: ${newStatus.toUpperCase()}`);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Update failed.');
    }
  };

  const openMaps = () => {
    const [lng, lat] = item.location.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=Pickup@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(Pickup)`
    });
    Linking.openURL(url);
  };

  const getStatusColor = (s) => {
    if (s === 'completed') return '#16a34a';
    if (s === 'in-progress') return '#2563eb';
    return '#ca8a04';
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
          <ChevronLeft color="#0f172a" size={30} />
        </TouchableOpacity>
        <HeaderTitle>Mission Logistics</HeaderTitle>
        <View style={{ width: 45 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageContainer>
            <MainImage 
                source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/logo.png')} 
                resizeMode={item.imageUrl ? "cover" : "contain"}
            />
            <StatusBadge bg={getStatusColor(status)}>
                <StatusText>{status.toUpperCase()}</StatusText>
            </StatusBadge>
        </ImageContainer>
        
        <Content>
          {isAdmin && (
            <AdminCard>
                <CommandLabel><Settings size={14} color="#0f172a" /> COMMAND OVERRIDE</CommandLabel>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AdminUserList', { requestId: item._id })}
                    activeOpacity={0.8}
                >
                    <LinearGradient 
                        colors={['#0f172a', '#1e293b']} 
                        style={{ padding: 16, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 15 }}
                    >
                        <Users color="#fff" size={18} />
                        <BtnText style={{ fontSize: 12 }}>RE-ASSIGN PERSONNEL</BtnText>
                    </LinearGradient>
                </TouchableOpacity>
            </AdminCard>
          )}

          <SectionLabel>Mission Parameters</SectionLabel>
          <InfoBox>
            <InfoItem>
                <IconCircle bg="#f0fdf4"><MapPin size={18} color="#15803d" /></IconCircle>
                <View style={{flex: 1}}><Label>Location</Label><Value numberOfLines={2}>{item.location?.address}</Value></View>
                {hasCoords && <TouchableOpacity onPress={openMaps} style={{ padding: 10 }}><NavIcon color="#15803d" size={24} /></TouchableOpacity>}
            </InfoItem>
            <Divider />
            <InfoItem>
                <IconCircle bg="#eff6ff"><Calendar size={18} color="#2563eb" /></IconCircle>
                <View style={{flex: 1}}><Label>Scheduled</Label><Value>{new Date(item.scheduledDate).toDateString()}</Value></View>
            </InfoItem>
          </InfoBox>

          <SectionLabel>Mission Personnel</SectionLabel>
          
          <PersonnelCard isMe={isMeCitizen}>
            <Avatar bg="#0f172a"><UserIcon color="#fff" size={20} /></Avatar>
            <ContactInfo><ContactName>{isMeCitizen ? "You (Reporter)" : item.citizen?.name}</ContactName><ContactRole>CITIZEN</ContactRole></ContactInfo>
            {!isMeCitizen && (
                <ActionRow>
                    <CircleBtn bg="#15803d" onPress={() => Linking.openURL(`tel:${item.citizen?.phone}`)}><Phone color="#fff" size={16} /></CircleBtn>
                    <CircleBtn bg="#0f172a" onPress={() => navigation.navigate('ChatRoom', { partner: { ...item.citizen, id: item.citizen?._id } })}><MessageCircle color="#fff" size={16} /></CircleBtn>
                </ActionRow>
            )}
          </PersonnelCard>

          <PersonnelCard isMe={isMeCollector}>
            <Avatar bg="#15803d"><ShieldCheck color="#fff" size={20} /></Avatar>
            <ContactInfo><ContactName>{isMeCollector ? "You (Staff)" : (item.collector?.name || 'Awaiting Staff')}</ContactName><ContactRole>COLLECTOR</ContactRole></ContactInfo>
            {item.collector && !isMeCollector && (
                <ActionRow>
                    <CircleBtn bg="#15803d" onPress={() => Linking.openURL(`tel:${item.collector?.phone}`)}><Phone color="#fff" size={16} /></CircleBtn>
                    <CircleBtn bg="#0f172a" onPress={() => navigation.navigate('ChatRoom', { partner: { ...item.collector, id: item.collector?._id } })}><MessageCircle color="#fff" size={16} /></CircleBtn>
                </ActionRow>
            )}
          </PersonnelCard>

          {isMeCollector && status !== 'completed' && (
            <ActionArea>
                <TouchableOpacity onPress={() => handleUpdate(status === 'assigned' ? 'in-progress' : 'completed')} activeOpacity={0.9}>
                    <LinearGradient colors={status === 'assigned' ? ['#2563eb', '#1d4ed8'] : ['#064e3b', '#15803d']} style={{ padding: 20, borderRadius: 20, alignItems: 'center', elevation: 8 }}>
                        {loading ? <ActivityIndicator color="#fff" /> : <BtnText>{status === 'assigned' ? 'START MISSION' : 'FINALIZE COLLECTION'}</BtnText>}
                    </LinearGradient>
                </TouchableOpacity>
            </ActionArea>
          )}

          {status === 'completed' && isMeCitizen && (
              <TouchableOpacity onPress={() => setShowRating(true)} activeOpacity={0.8}>
                <FeedbackCard><Star color="#16a34a" size={24} fill="#16a34a" /><FeedbackText>RATE PERFORMANCE</FeedbackText></FeedbackCard>
              </TouchableOpacity>
          )}

          <View style={{ height: 60 }} />
        </Content>
      </ScrollView>

      <RatingModal isVisible={showRating} onClose={() => setShowRating(false)} requestId={item._id} collectorName={item.collector?.name} />
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #ffffff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;
const ImageContainer = styled.View` width: 100%; height: 260px; background: #f8fafc; position: relative; `;
const MainImage = styled.Image` width: 100%; height: 100%; `;
const StatusBadge = styled.View` position: absolute; top: 20px; right: 20px; background: ${props => props.bg}; padding: 8px 16px; border-radius: 12px; elevation: 10; border: 2px solid #fff; `;
const StatusText = styled.Text` color: #fff; font-weight: 900; font-size: 10px; `;
const Content = styled.View` padding: 25px; background: #fff; border-top-left-radius: 35px; border-top-right-radius: 35px; margin-top: -40px; `;
const AdminCard = styled.View` background: #f8fafc; border-radius: 24px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0; elevation: 4; `;
const CommandLabel = styled.Text` font-size: 10px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; text-align: center; `;
const SectionLabel = styled.Text` font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1.5px; `;
const InfoBox = styled.View` background: #f8fafc; border-radius: 24px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 30px; `;
const InfoItem = styled.View` flex-direction: row; align-items: center; gap: 15px; padding: 8px 0; `;
const IconCircle = styled.View` width: 42px; height: 42px; border-radius: 14px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const Label = styled.Text` font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; `;
const Value = styled.Text` font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; `;
const Divider = styled.View` height: 1px; background: #f1f5f9; margin: 10px 0; `;
const PersonnelCard = styled.View` flex-direction: row; align-items: center; background: ${props => props.isMe ? '#f8fafc' : '#fff'}; border-radius: 22px; padding: 15px; margin-bottom: 12px; border: 1px solid #f1f5f9; elevation: ${props => props.isMe ? 0 : 3}; opacity: ${props => props.isMe ? 0.7 : 1}; `;
const Avatar = styled.View` width: 48px; height: 48px; border-radius: 24px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const ContactInfo = styled.View` flex: 1; margin-left: 15px; `;
const ContactName = styled.Text` font-size: 15px; font-weight: 800; color: #1e293b; `;
const ContactRole = styled.Text` font-size: 9px; font-weight: 900; color: #94a3b8; margin-top: 2px; `;
const ActionRow = styled.View` flex-direction: row; gap: 8px; `;
const CircleBtn = styled.TouchableOpacity` width: 40px; height: 40px; border-radius: 20px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const ActionArea = styled.View` margin-top: 30px; `;
const BtnText = styled.Text` color: #fff; font-size: 13px; font-weight: 900; letter-spacing: 1px; `;
const FeedbackCard = styled.View` flex-direction: row; align-items: center; justify-content: center; background: #fff; border: 2px dashed #16a34a; padding: 20px; border-radius: 20px; gap: 12px; margin-top: 20px; `;
const FeedbackText = styled.Text` color: #16a34a; font-weight: 900; font-size: 12px; `;

export default RequestDetailScreen;