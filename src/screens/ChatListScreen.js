import React, { useState, useCallback, useContext } from 'react';
import { 
  FlatList, RefreshControl, ActivityIndicator, View, 
  TouchableOpacity, StatusBar, TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ChevronRight, Search, User, ChevronLeft, 
  ShieldCheck, MessageSquare, Headset 
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = async () => {
    try {
      /**
       * DATA ORCHESTRATION
       * 1. Get all pickup requests (to find collectors/citizens)
       * 2. Get all Admins (for the Support Channel)
       * 3. Get unread counts
       */
      const [reqRes, adminRes, unreadRes] = await Promise.all([
        apiClient.get('/requests'),
        apiClient.get('/auth/admins'),
        apiClient.get('/messages/unread').catch(() => ({ data: { data: [] } }))
      ]);

      const requests = reqRes.data.data || [];
      const admins = adminRes.data.data || [];
      const unreadData = unreadRes.data.data || [];

      const list = [];
      const seenIds = new Set();

      // STEP 1: ADD ADMINS (Official Support Channel)
      admins.forEach(admin => {
        if (admin._id !== user._id) { // Don't show myself to myself
          seenIds.add(admin._id);
          const unreadMatch = unreadData.find(u => u._id === admin._id);
          list.push({
            id: admin._id,
            name: `${admin.name} (Support)`,
            role: 'admin',
            unread: unreadMatch?.count || 0,
            isSupport: true,
            avatar: admin.avatarUrl
          });
        }
      });

      // STEP 2: ADD MISSION PARTNERS
      requests.forEach(req => {
        const partner = user.role === 'citizen' ? req.collector : req.citizen;
        if (partner && partner._id && !seenIds.has(partner._id)) {
          seenIds.add(partner._id);
          const unreadMatch = unreadData.find(u => u._id === partner._id);
          list.push({
            id: partner._id,
            name: partner.name,
            role: partner.role,
            unread: unreadMatch?.count || 0,
            isSupport: false,
            avatar: partner.avatarUrl
          });
        }
      });
      
      setContacts(list);
    } catch (e) {
      console.log("Inbox Sync Error:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInbox(); }, []));

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Header>
        <Title>Eco Messages</Title>
        <Subtitle>Connect with support or your team</Subtitle>
      </Header>

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ContactCard activeOpacity={0.7} onPress={() => navigation.navigate('ChatRoom', { partner: item })}>
              <AvatarWrapper isSupport={item.isSupport} hasUnread={item.unread > 0}>
                <AvatarInner isSupport={item.isSupport}>
                    {item.avatar ? (
                        <AvatarImg source={{ uri: item.avatar }} />
                    ) : (
                        item.isSupport ? <ShieldCheck color="#fff" size={24} /> : <User color="#fff" size={24} />
                    )}
                </AvatarInner>
              </AvatarWrapper>

              <ContactBody>
                <NameRow>
                  <Name numberOfLines={1}>{item.name}</Name>
                  {item.unread > 0 && <Badge><BadgeText>{item.unread}</BadgeText></Badge>}
                </NameRow>
                <RoleText isSupport={item.isSupport}>
                    {item.isSupport ? "OFFICIAL SYSTEM SUPPORT" : item.role.toUpperCase()}
                </RoleText>
              </ContactBody>

              <ChevronRight color="#cbd5e1" size={20} />
            </ContactCard>
          )}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchInbox();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyBox>
                <Headset size={50} color="#cbd5e1" />
                <EmptyTitle>No Contacts</EmptyTitle>
                <EmptySub>No administrators or collection partners are active yet.</EmptySub>
            </EmptyBox>
          }
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #fff; `;
const Centered = styled.View` flex: 1; justify-content: center; `;

const Header = styled.View` padding: 20px 25px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 28px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px; `;

const ContactCard = styled.TouchableOpacity` flex-direction: row; align-items: center; padding: 16px 0; border-bottom-width: 1px; border-bottom-color: #f8fafc; `;

const AvatarWrapper = styled.View` 
    padding: 3px; border-radius: 30px; 
    border: 2px solid ${props => props.hasUnread ? (props.isSupport ? '#0f172a' : '#15803d') : 'transparent'}; 
`;

const AvatarInner = styled.View` 
    width: 56px; height: 56px; border-radius: 28px; 
    background: ${props => props.isSupport ? '#0f172a' : '#15803d'}; 
    justify-content: center; align-items: center; overflow: hidden;
`;

const AvatarImg = styled.Image` width: 100%; height: 100%; `;

const ContactBody = styled.View` flex: 1; margin-left: 15px; `;

const NameRow = styled.View` flex-direction: row; align-items: center; gap: 10px; `;

const Name = styled.Text` font-size: 16px; font-weight: 800; color: #1e293b; `;

const RoleText = styled.Text` font-size: 10px; color: ${props => props.isSupport ? '#2563eb' : '#94a3b8'}; font-weight: 900; margin-top: 3px; letter-spacing: 0.5px; `;

const Badge = styled.View` background: #ef4444; min-width: 20px; height: 20px; border-radius: 10px; justify-content: center; align-items: center; border: 2px solid #fff; `;
const BadgeText = styled.Text` color: #fff; font-size: 9px; font-weight: 900; `;

const EmptyBox = styled.View` align-items: center; margin-top: 100px; padding: 40px; `;
const EmptyTitle = styled.Text` font-size: 18px; font-weight: 900; color: #1e293b; margin-top: 20px; `;
const EmptySub = styled.Text` font-size: 13px; color: #94a3b8; text-align: center; margin-top: 10px; line-height: 20px; `;

export default ChatListScreen;