import React, { useState, useContext } from 'react';
import { ScrollView, Image, Linking, Alert, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { MapPin, Phone, Calendar, ChevronLeft, User as UserIcon } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const RequestDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(item.status);

  const isCollector = user?.role === 'collector';

  const handleUpdate = async (newStatus) => {
    // 1. Start loading
    setLoading(true);
    
    try {
      // 2. Call the API
      await apiClient.put(`/requests/${item._id}/status`, { status: newStatus });
      
      // 3. Update local state immediately
      setStatus(newStatus);
      
      // 4. CRITICAL: Stop loading BEFORE showing the Alert
      setLoading(false);
      
      // 5. Show success message
      Alert.alert(
        'Success', 
        `Pickup status changed to ${newStatus.toUpperCase()}`,
        [{ text: 'OK', onPress: () => { if(newStatus === 'completed') navigation.goBack(); } }]
      );

    } catch (e) {
      setLoading(false); // Stop loading on error too
      Alert.alert('Error', e.response?.data?.message || 'Update failed. Check your connection.');
    }
  };

  return (
    <Container>
      <Header>
        <TouchableOpacityStyled onPress={() => navigation.goBack()}>
          <ChevronLeft color="#0f172a" size={28} />
        </TouchableOpacityStyled>
        <HeaderTitle>Task Details</HeaderTitle>
        <View style={{ width: 28 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <MainImage 
          source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/logo.png')} 
          resizeMode={item.imageUrl ? "cover" : "contain"}
        />
        
        <Content>
          <BadgeRow>
            <WasteBadge><WasteText>{item.wasteType}</WasteText></WasteBadge>
            <StatusText status={status}>{status.toUpperCase()}</StatusText>
          </BadgeRow>

          <InfoBox>
            <InfoItem>
              <MapPin size={20} color="#15803d" />
              <Value>{item.location.address}</Value>
            </InfoItem>
            <InfoItem>
              <Calendar size={20} color="#15803d" />
              <Value>{new Date(item.scheduledDate).toDateString()}</Value>
            </InfoItem>
          </InfoBox>

          <SectionTitle>{isCollector ? 'Citizen Contact' : 'Assigned Collector'}</SectionTitle>
          <ContactCard>
            <UserIcon color="#15803d" size={24} />
            <ContactInfo>
              <Name>{isCollector ? item.citizen?.name : (item.collector?.name || 'Waiting for assignment')}</Name>
              <PhoneText>{isCollector ? item.citizen?.phone : (item.collector?.phone || 'No phone available')}</PhoneText>
            </ContactInfo>
            {(isCollector ? item.citizen?.phone : item.collector?.phone) && (
              <CallBtn onPress={() => Linking.openURL(`tel:${isCollector ? item.citizen?.phone : item.collector?.phone}`)}>
                <Phone color="#fff" size={18} />
              </CallBtn>
            )}
          </ContactCard>

          {isCollector && status !== 'completed' && (
            <ActionArea>
              {status === 'assigned' ? (
                <Btn bg="#2563eb" onPress={() => handleUpdate('in-progress')} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <BtnText>Start Collection</BtnText>}
                </Btn>
              ) : (
                <Btn bg="#16a34a" onPress={() => handleUpdate('completed')} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <BtnText>Mark Completed</BtnText>}
                </Btn>
              )}
            </ActionArea>
          )}
        </Content>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const TouchableOpacityStyled = styled.TouchableOpacity``;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const MainImage = styled.Image` width: 100%; height: 250px; background: #f8fafc; `;
const Content = styled.View` padding: 25px 20px; `;
const BadgeRow = styled.View` flex-direction: row; justify-content: space-between; margin-bottom: 20px; `;
const WasteBadge = styled.View` background: #f0fdf4; padding: 6px 15px; border-radius: 10px; `;
const WasteText = styled.Text` color: #15803d; font-weight: 700; text-transform: capitalize; `;
const StatusText = styled.Text` font-weight: 800; color: ${props => props.status === 'completed' ? '#16a34a' : '#ca8a04'}; `;
const InfoBox = styled.View` background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 20px; border: 1px solid #e2e8f0; `;
const InfoItem = styled.View` flex-direction: row; align-items: center; margin-bottom: 10px; `;
const Value = styled.Text` margin-left: 10px; font-weight: 600; color: #1e293b; flex: 1; `;
const SectionTitle = styled.Text` font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 12px; `;
const ContactCard = styled.View` flex-direction: row; align-items: center; background: #f1f5f9; padding: 15px; border-radius: 15px; `;
const ContactInfo = styled.View` flex: 1; margin-left: 12px; `;
const Name = styled.Text` font-weight: 700; color: #1e293b; `;
const PhoneText = styled.Text` color: #64748b; font-size: 12px; `;
const CallBtn = styled.TouchableOpacity` background: #15803d; padding: 12px; border-radius: 12px; `;
const ActionArea = styled.View` margin-top: 30px; margin-bottom: 40px; `;
const Btn = styled.TouchableOpacity` background: ${props => props.bg}; padding: 18px; borderRadius: 15px; align-items: center; elevation: 4; shadow-opacity: 0.2; shadow-radius: 5px; `;
const BtnText = styled.Text` color: #fff; font-weight: 800; font-size: 16px; `;

export default RequestDetailScreen;