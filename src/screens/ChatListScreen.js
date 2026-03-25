import React, { useState, useCallback, useContext } from 'react';
import { 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, MessageSquare, User, ChevronLeft } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = async () => {
    try {
      const [reqRes, unreadRes] = await Promise.all([
        apiClient.get('/requests'),
        apiClient.get('/messages/unread').catch(() => ({ data: { data: [] } }))
      ]);

      const requests = reqRes.data.data || [];
      const unreadData = unreadRes.data.data || [];
      const uniqueContacts = [];
      const seenIds = new Set();

      requests.forEach(req => {
        const partner = user.role === 'citizen' ? req.collector : req.citizen;

        if (partner && partner._id && !seenIds.has(partner._id)) {
          seenIds.add(partner._id);
          const unreadMatch = unreadData.find(u => u._id === partner._id);
          
          uniqueContacts.push({
            id: partner._id,
            name: partner.name || "Eco User",
            role: partner.role || "user", // If backend fixed, this will now be "collector" or "citizen"
            unread: unreadMatch ? unreadMatch.count : 0,
            lastLocation: req.location?.address || 'Pickup Point'
          });
        }
      });
      setContacts(uniqueContacts);
    } catch (e) {
      console.log("Chat List Fetch Error:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInbox(); }, []));

  const renderItem = ({ item }) => (
    <ContactCard 
      onPress={() => navigation.navigate('ChatRoom', { partner: item })}
      activeOpacity={0.7}
    >
      <Avatar><User color="#fff" size={24} /></Avatar>
      
      <ContactInfo>
        <Name>{item.name}</Name>
        <RoleRow>
            <RoleText>{String(item.role).toUpperCase()}</RoleText>
            <BulletText> • </BulletText>
            <LocationText numberOfLines={1}>{item.lastLocation}</LocationText>
        </RoleRow>
      </ContactInfo>

      {/* FIX: Explicit boolean check to prevent '0' from rendering as a string */}
      {item.unread > 0 ? (
        <UnreadBadge>
          <UnreadText>{item.unread}</UnreadText>
        </UnreadBadge>
      ) : null}
      
      <ChevronRight color="#cbd5e1" size={20} />
    </ContactCard>
  );

  return (
    <Container>
      <HeaderWrapper>
        <SafeAreaView edges={['top']}>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
              <ChevronLeft color="#0f172a" size={28} />
            </TouchableOpacity>
            <Title>Inbox</Title>
            <View style={{ width: 48 }} />
          </Header>
        </SafeAreaView>
      </HeaderWrapper>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchInbox();}} />
          }
          ListEmptyComponent={
            <EmptyContainer>
              <IconCircle><MessageSquare size={40} color="#15803d" /></IconCircle>
              <EmptyTitle>No messages yet</EmptyTitle>
              <EmptySub>Your active pickup contacts will appear here.</EmptySub>
            </EmptyContainer>
          }
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #fff; `;
const HeaderWrapper = styled.View` background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding-bottom: 5px; `;
const Title = styled.Text` font-size: 20px; font-weight: 800; color: #0f172a; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const ContactCard = styled.TouchableOpacity` flex-direction: row; align-items: center; padding: 16px; background: #f8fafc; border-radius: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const Avatar = styled.View` width: 50px; height: 50px; border-radius: 25px; background: #15803d; justify-content: center; align-items: center; `;
const ContactInfo = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-size: 16px; font-weight: 700; color: #1e293b; `;
const RoleRow = styled.View` flex-direction: row; align-items: center; margin-top: 3px; `;
const RoleText = styled.Text` font-size: 10px; color: #15803d; font-weight: 800; letter-spacing: 0.5px; `;
const BulletText = styled.Text` color: #cbd5e1; font-size: 10px; `;
const LocationText = styled.Text` font-size: 10px; color: #64748b; font-weight: 600; flex: 1; `;
const UnreadBadge = styled.View` background: #ef4444; min-width: 22px; height: 22px; border-radius: 11px; justify-content: center; align-items: center; margin-right: 10px; border: 2px solid #fff; `;
const UnreadText = styled.Text` color: #fff; font-size: 10px; font-weight: 900; `;
const EmptyContainer = styled.View` align-items: center; margin-top: 100px; padding: 40px; `;
const IconCircle = styled.View` width: 80px; height: 80px; border-radius: 40px; background: #f0fdf4; justify-content: center; align-items: center; margin-bottom: 20px; `;
const EmptyTitle = styled.Text` font-size: 18px; font-weight: 700; color: #1e293b; `;
const EmptySub = styled.Text` text-align: center; color: #94a3b8; margin-top: 10px; line-height: 20px; `;

export default ChatListScreen;