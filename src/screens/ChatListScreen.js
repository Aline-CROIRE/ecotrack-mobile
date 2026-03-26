import React, { useState, useCallback, useContext } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, MessageSquare, User, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = async () => {
    try {
      // 1. Parallel fetch: My Requests, My Unread Counts, and the Admin User
      const [reqRes, unreadRes, adminRes] = await Promise.all([
        apiClient.get('/requests'),
        apiClient.get('/messages/unread').catch(() => ({ data: { data: [] } })),
        apiClient.get('/auth/admins')
      ]);

      const requests = reqRes.data.data || [];
      const unreadData = unreadRes.data.data || [];
      const admins = adminRes.data.data || [];

      const uniqueContacts = [];
      const seenIds = new Set();

      // 2. ALWAYS INJECT ADMINS FIRST (So users can get support)
      admins.forEach(admin => {
        if (admin._id !== user._id) {
          seenIds.add(admin._id);
          const unreadMatch = unreadData.find(u => u._id === admin._id);
          uniqueContacts.push({
            id: admin._id,
            name: `${admin.name} (Support)`,
            role: 'admin',
            unread: unreadMatch ? unreadMatch.count : 0,
            isSupport: true
          });
        }
      });

      // 3. ADD ASSIGNED PARTNERS
      requests.forEach(req => {
        const partner = user.role === 'citizen' ? req.collector : req.citizen;
        if (partner && partner._id && !seenIds.has(partner._id)) {
          seenIds.add(partner._id);
          const unreadMatch = unreadData.find(u => u._id === partner._id);
          uniqueContacts.push({
            id: partner._id,
            name: partner.name,
            role: partner.role,
            unread: unreadMatch ? unreadMatch.count : 0,
            isSupport: false
          });
        }
      });
      
      setContacts(uniqueContacts);
    } catch (e) { console.log("Inbox Error"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchInbox(); }, []));

  const renderItem = ({ item }) => (
    <ContactCard onPress={() => navigation.navigate('ChatRoom', { partner: item })}>
      <Avatar isSupport={item.isSupport}>
        {item.isSupport ? <ShieldCheck color="#fff" size={24} /> : <User color="#fff" size={24} />}
      </Avatar>
      <ContactInfo>
        <Name>{item.name}</Name>
        <RoleText isSupport={item.isSupport}>
            {item.isSupport ? "OFFICIAL SYSTEM SUPPORT" : item.role.toUpperCase()}
        </RoleText>
      </ContactInfo>
      {item.unread > 0 && <Badge><BadgeText>{item.unread}</BadgeText></Badge>}
      <ChevronRight color="#cbd5e1" size={20} />
    </ContactCard>
  );

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#0f172a" size={28} /></TouchableOpacity>
        <Title>Eco Messages</Title>
        <View style={{ width: 28 }} />
      </Header>

      {loading && !refreshing ? <Centered><ActivityIndicator size="large" color="#15803d" /></Centered> : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchInbox();}} />}
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #ffffff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 20px; font-weight: 800; `;
const Centered = styled.View` flex: 1; justify-content: center; `;
const ContactCard = styled.TouchableOpacity` flex-direction: row; align-items: center; padding: 16px; background: #f8fafc; border-radius: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const Avatar = styled.View` width: 52px; height: 52px; border-radius: 26px; background: ${props => props.isSupport ? '#0f172a' : '#15803d'}; justify-content: center; align-items: center; `;
const ContactInfo = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-size: 16px; font-weight: 700; color: #1e293b; `;
const RoleText = styled.Text` font-size: 10px; color: ${props => props.isSupport ? '#2563eb' : '#64748b'}; font-weight: 800; margin-top: 3px; `;
const Badge = styled.View` background: #ef4444; min-width: 22px; height: 22px; border-radius: 11px; justify-content: center; align-items: center; margin-right: 10px; border: 2px solid #fff; `;
const BadgeText = styled.Text` color: #fff; font-size: 10px; font-weight: 900; `;

export default ChatListScreen;