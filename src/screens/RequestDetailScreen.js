import React, { useState, useContext } from 'react';
import { ScrollView, Image, Linking, Alert, ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { MapPin, Phone, Calendar, ChevronLeft, User as UserIcon, Navigation as NavIcon } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const RequestDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(item.status);

  const isCollector = user?.role === 'collector';
  // Check if coordinates exist safely
  const hasCoords = item?.location?.coordinates && item.location.coordinates[0] !== 0;

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/requests/${item._id}/status`, { status: newStatus });
      setStatus(newStatus);
      setLoading(false);
      Alert.alert('Success', `Status: ${newStatus.toUpperCase()}`, [
        { text: 'OK', onPress: () => { if(newStatus === 'completed') navigation.navigate('Main'); }}
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update');
    }
  };

  const openMaps = () => {
    if (!hasCoords) return Alert.alert('Error', 'No GPS data for this request');
    
    const [lng, lat] = item.location.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=Waste@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(Waste)`
    });
    Linking.openURL(url);
  };

  return (
    <Container>
      <Header>
        <TouchableOpacityStyled onPress={() => navigation.goBack()}><ChevronLeft color="#0f172a" size={28} /></TouchableOpacityStyled>
        <HeaderTitle>Details</HeaderTitle>
        <View style={{ width: 28 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <MainImage source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/logo.png')} />
        
        <Content>
          <BadgeRow>
            <WasteBadge><WasteText>{item.wasteType}</WasteText></WasteBadge>
            <StatusText status={status}>{status.toUpperCase()}</StatusText>
          </BadgeRow>

          <InfoBox>
            <InfoItem>
              <MapPin size={20} color="#15803d" />
              <Value>{item?.location?.address || "No Address"}</Value>
            </InfoItem>
            <InfoItem>
              <Calendar size={20} color="#15803d" />
              <Value>{new Date(item.scheduledDate).toDateString()}</Value>
            </InfoItem>
          </InfoBox>

          {isCollector && status !== 'completed' && hasCoords && (
            <NavButton onPress={openMaps} activeOpacity={0.8}>
              <NavIcon color="#fff" size={20} />
              <NavButtonText>Navigate to GPS Pin</NavButtonText>
            </NavButton>
          )}

          <SectionTitle>{isCollector ? 'Citizen Contact' : 'Assigned Collector'}</SectionTitle>
          <ContactCard>
            <UserIcon color="#15803d" size={24} />
            <ContactInfo>
              <Name>{isCollector ? item.citizen?.name : (item.collector?.name || 'Waiting...')}</Name>
              <PhoneText>{isCollector ? item.citizen?.phone : (item.collector?.phone || 'No phone')}</PhoneText>
            </ContactInfo>
            <CallBtn onPress={() => Linking.openURL(`tel:${isCollector ? item.citizen?.phone : item.collector?.phone}`)}><Phone color="#fff" size={18} /></CallBtn>
          </ContactCard>

          {isCollector && status !== 'completed' && (
            <ActionArea>
              {status === 'assigned' ? (
                <Btn bg="#2563eb" onPress={() => handleUpdate('in-progress')} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <BtnText>Start Collection</BtnText>}
                </Btn>
              ) : (
                <Btn bg="#16a34a" onPress={() => handleUpdate('completed')} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <BtnText>Complete</BtnText>}
                </Btn>
              )}
            </ActionArea>
          )}
        </Content>
      </ScrollView>
    </Container>
  );
};

const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const TouchableOpacityStyled = styled.TouchableOpacity``;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 800; `;
const MainImage = styled.Image` width: 100%; height: 250px; background: #f8fafc; `;
const Content = styled.View` padding: 25px 20px; `;
const BadgeRow = styled.View` flex-direction: row; justify-content: space-between; margin-bottom: 20px; `;
const WasteBadge = styled.View` background: #f0fdf4; padding: 6px 15px; border-radius: 10px; `;
const WasteText = styled.Text` color: #15803d; font-weight: 700; `;
const StatusText = styled.Text` font-weight: 800; color: ${props => props.status === 'completed' ? '#16a34a' : '#ca8a04'}; `;
const InfoBox = styled.View` background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 15px; `;
const InfoItem = styled.View` flex-direction: row; align-items: center; margin-bottom: 10px; `;
const Value = styled.Text` margin-left: 10px; font-weight: 600; color: #1e293b; flex: 1; `;
const NavButton = styled.TouchableOpacity` background: #0f172a; padding: 15px; border-radius: 12px; flex-direction: row; justify-content: center; align-items: center; gap: 10px; margin-bottom: 25px; `;
const NavButtonText = styled.Text` color: #fff; font-weight: 800; `;
const SectionTitle = styled.Text` font-size: 16px; font-weight: 800; margin-bottom: 12px; `;
const ContactCard = styled.View` flex-direction: row; align-items: center; background: #f1f5f9; padding: 15px; border-radius: 15px; `;
const ContactInfo = styled.View` flex: 1; margin-left: 12px; `;
const Name = styled.Text` font-weight: 700; `;
const PhoneText = styled.Text` color: #64748b; font-size: 12px; `;
const CallBtn = styled.TouchableOpacity` background: #15803d; padding: 10px; border-radius: 10px; `;
const ActionArea = styled.View` margin-top: 30px; `;
const Btn = styled.TouchableOpacity` background: ${props => props.bg}; padding: 18px; borderRadius: 15px; align-items: center; `;
const BtnText = styled.Text` color: #fff; font-weight: 800; `;

export default RequestDetailScreen;