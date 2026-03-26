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
  ShieldCheck, MessageSquare, Users, Contact
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // ADMIN TOGGLE: 'chats' or 'directory'
  const [viewMode, setViewMode] = useState('chats'); 

  const isAdmin = user?.role === 'admin';

  const fetchContacts = async () => {
    try {
      /**
       * LOGIC ENGINE
       * If mode is 'directory', fetch ALL users.
       * If mode is 'chats', fetch active mission partners.
       */
      const endpoint = (isAdmin && viewMode === 'directory') ? '/auth/users' : '/requests';
      
      const [dataRes, unreadRes] = await Promise.all([
        apiClient.get(endpoint),
        apiClient.get('/messages/unread').catch(() => ({ data: { data: [] } }))
      ]);

      const rawData = dataRes.data.data || [];
      const unreadData = unreadRes.data.data || [];
      const list = [];
      const seenIds = new Set();

      if (isAdmin && viewMode === 'directory') {
        // Mode: DIRECTORY (All System Users)
        rawData.forEach(u => {
          if (u._id !== user._id) {
            list.push({
              id: u._id,
              name: u.name,
              role: u.role,
              unread: 0,
              isSupport: u.role === 'admin'
            });
          }
        });
      } else {
        // Mode: ACTIVE CHATS (Mission Partners)
        rawData.forEach(req => {
          const partner = user.role === 'citizen' ? req.collector : req.citizen;
          if (partner && partner._id && !seenIds.has(partner._id)) {
            seenIds.add(partner._id);
            const unreadMatch = unreadData.find(u => u._id === partner._id);
            list.push({
              id: partner._id,
              name: partner.name,
              role: partner.role,
              unread: unreadMatch?.count || 0,
              isSupport: partner.role === 'admin'
            });
          }
        });
      }
      setContacts(list);
    } catch (e) {
      console.log("Chat List Fetch Error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchContacts(); }, [viewMode]));

  // Search filter logic
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <ContactCard activeOpacity={0.7} onPress={() => navigation.navigate('ChatRoom', { partner: item })}>
      <AvatarWrapper role={item.role} hasUnread={item.unread > 0}>
        <AvatarInner role={item.role}>
          {item.role === 'admin' ? <ShieldCheck color="#fff" size={24} /> : <User color="#fff" size={24} />}
        </AvatarInner>
      </AvatarWrapper>

      <ContactBody>
        <NameRow>
          <Name numberOfLines={1}>{item.name}</Name>
          {item.unread > 0 && <NewBadge><NewText>NEW</NewText></NewBadge>}
        </NameRow>
        <RoleLabel role={item.role}>{item.role.toUpperCase()}</RoleLabel>
      </ContactBody>

      {item.unread > 0 && <UnreadCount><CountText>{item.unread}</CountText></UnreadCount>}
      <ChevronRight color="#cbd5e1" size={18} />
    </ContactCard>
  );

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* HEADER SECTION */}
      <Header>
        <HeaderTop>
            <Title>Eco Inbox</Title>
            <IconButton bg="#f8fafc">
                <Search color="#94a3b8" size={20} />
            </IconButton>
        </HeaderTop>
        
        <SearchContainer>
            <TextInput 
                placeholder={viewMode === 'directory' ? "Search city directory..." : "Search messages..."}
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 15, fontWeight: '700', color: '#0f172a' }}
            />
        </SearchContainer>
      </Header>

      {/* ADMIN VIEW TOGGLE */}
      {isAdmin && (
        <ToggleBar>
            <ToggleButton 
                active={viewMode === 'chats'} 
                onPress={() => setViewMode('chats')}
            >
                <MessageSquare size={16} color={viewMode === 'chats' ? '#15803d' : '#94a3b8'} />
                <ToggleLabel active={viewMode === 'chats'}>ACTIVE CHATS</ToggleLabel>
            </ToggleButton>
            <ToggleButton 
                active={viewMode === 'directory'} 
                onPress={() => setViewMode('directory')}
            >
                <Users size={16} color={viewMode === 'directory' ? '#15803d' : '#94a3b8'} />
                <ToggleLabel active={viewMode === 'directory'}>CITY DIRECTORY</ToggleLabel>
            </ToggleButton>
        </ToggleBar>
      )}

      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchContacts();}} tintColor="#15803d" />}
          ListEmptyComponent={
            <EmptyBox>
                <Contact size={50} color="#cbd5e1" />
                <EmptyTitle>No contacts found</EmptyTitle>
                <EmptySub>Users will appear here as they join the network.</EmptySub>
            </EmptyBox>
          }
        />
      )}
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #fff; `;
const Header = styled.View` padding: 15px 20px 20px; background: #fff; `;
const HeaderTop = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const Title = styled.Text` font-size: 28px; font-weight: 900; color: #0f172a; `;
const IconButton = styled.View` background: ${props => props.bg}; width: 40px; height: 40px; border-radius: 12px; justify-content: center; align-items: center; `;

const SearchContainer = styled.View` background: #f8fafc; border-radius: 15px; border: 1px solid #e2e8f0; `;

const ToggleBar = styled.View` flex-direction: row; padding: 0 20px 15px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const ToggleButton = styled.TouchableOpacity` flex: 1; flex-direction: row; align-items: center; justify-content: center; padding: 10px; border-bottom-width: 2px; border-bottom-color: ${props => props.active ? '#15803d' : 'transparent'}; gap: 8px; `;
const ToggleLabel = styled.Text` font-size: 10px; font-weight: 900; color: ${props => props.active ? '#15803d' : '#94a3b8'}; letter-spacing: 1px; `;

const ContactCard = styled.TouchableOpacity` flex-direction: row; align-items: center; padding: 15px 0; border-bottom-width: 1px; border-bottom-color: #f8fafc; `;
const AvatarWrapper = styled.View` padding: 2px; border-radius: 30px; border: 2px solid ${props => props.hasUnread ? '#15803d' : 'transparent'}; `;
const AvatarInner = styled.View` 
    width: 54px; height: 54px; border-radius: 27px; 
    background: ${props => props.role === 'admin' ? '#0f172a' : (props.role === 'collector' ? '#15803d' : '#2563eb')}; 
    justify-content: center; align-items: center; 
`;

const ContactBody = styled.View` flex: 1; margin-left: 15px; `;
const NameRow = styled.View` flex-direction: row; align-items: center; gap: 8px; `;
const Name = styled.Text` font-size: 16px; font-weight: 800; color: #1e293b; `;
const NewBadge = styled.View` background: #dcfce7; padding: 2px 6px; border-radius: 4px; `;
const NewText = styled.Text` font-size: 8px; font-weight: 900; color: #16a34a; `;

const RoleLabel = styled.Text` font-size: 10px; font-weight: 800; margin-top: 3px; color: #94a3b8; `;

const UnreadCount = styled.View` background: #ef4444; min-width: 20px; height: 20px; border-radius: 10px; justify-content: center; align-items: center; margin-right: 10px; border: 2px solid #fff; `;
const CountText = styled.Text` color: #fff; font-size: 9px; font-weight: 900; `;

const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const EmptyBox = styled.View` align-items: center; margin-top: 80px; padding: 40px; `;
const EmptyTitle = styled.Text` font-size: 18px; font-weight: 900; color: #1e293b; margin-top: 15px; `;
const EmptySub = styled.Text` font-size: 13px; color: #94a3b8; text-align: center; margin-top: 8px; line-height: 20px; `;

export default ChatListScreen;