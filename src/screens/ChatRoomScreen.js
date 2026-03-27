import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FlatList, KeyboardAvoidingView, Platform, View, 
  ActivityIndicator, TouchableOpacity, TextInput, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Send, ChevronLeft, Phone, CheckCheck, User } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatRoomScreen = ({ route, navigation }) => {
  const { partner } = route.params; // { id, name, role }
  const { user } = useContext(AuthContext);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  /**
   * 1. DATA SYNC
   * Pulls the real conversation from the cloud
   */
  const fetchMessages = async () => {
    if (!partner?.id) return;
    try {
      const res = await apiClient.get(`/messages/${partner.id}`);
      setMessages(res.data.data);
    } catch (e) {
      console.log("Chat sync interrupted");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Real-time feel: Check for new messages every 4 seconds
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 2. TRANSMIT LOGIC
   * Sends the message and snaps the UI to the latest bubble
   */
  const sendMessage = async () => {
    if (!message.trim()) return;
    const content = message;
    setMessage('');
    
    try {
      const res = await apiClient.post('/messages', {
        recipientId: partner.id,
        content: content
      });
      setMessages(prev => [...prev, res.data.data]);
      // Snap to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.log("Message failed to send");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
      {/* PREMIUM HEADER */}
      <HeaderWrapper>
        <SafeAreaView edges={['top']}>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                <ChevronLeft color="#0f172a" size={30} />
            </TouchableOpacity>
            
            <HeaderInfo>
                <AvatarSmall>
                    <User color="#15803d" size={16} />
                </AvatarSmall>
                <View style={{ alignItems: 'center' }}>
                    <PartnerName numberOfLines={1}>{partner.name}</PartnerName>
                    <StatusRow>
                        <StatusDot />
                        <StatusText>ACTIVE NOW</StatusText>
                    </StatusRow>
                </View>
            </HeaderInfo>

            <TouchableOpacity style={{ padding: 10 }}>
                <Phone color="#15803d" size={24} />
            </TouchableOpacity>
          </Header>
        </SafeAreaView>
      </HeaderWrapper>

      {/* MESSAGES AREA */}
      {loading ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BubbleContainer me={item.sender === user._id}>
                <Bubble me={item.sender === user._id}>
                    <BubbleText me={item.sender === user._id}>{item.content}</BubbleText>
                    <MetaRow>
                        <Time me={item.sender === user._id}>{formatTime(item.createdAt)}</Time>
                        {item.sender === user._id && <CheckCheck size={14} color="rgba(255,255,255,0.6)" />}
                    </MetaRow>
                </Bubble>
            </BubbleContainer>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyBox>
                <MessageText>You haven't messaged {partner.name} yet. Send a note to coordinate your pickup.</MessageText>
            </EmptyBox>
          }
        />
      )}

      {/* TACTILE INPUT BAR */}
      <InputAreaContainer>
        <InputBox>
          <StyledInput 
            placeholder="Type your message here..." 
            placeholderTextColor="#94a3b8"
            value={message} 
            onChangeText={setMessage} 
            multiline
          />
          <SendButton onPress={sendMessage} disabled={!message.trim()} activeOpacity={0.8}>
            <Send color="#fff" size={22} />
          </SendButton>
        </InputBox>
      </InputAreaContainer>
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---

const Container = styled(KeyboardAvoidingView)` flex: 1; background: #f8fafc; `;

const HeaderWrapper = styled.View` background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; elevation: 4; shadow-opacity: 0.05; shadow-radius: 10px; `;

const Header = styled.View` flex-direction: row; align-items: center; justify-content: space-between; padding: 5px 10px; `;

const HeaderInfo = styled.View` flex: 1; flex-direction: row; align-items: center; justify-content: center; gap: 10px; `;

const AvatarSmall = styled.View` width: 32px; height: 32px; border-radius: 16px; background: #f0fdf4; justify-content: center; align-items: center; border: 1px solid #dcfce7; `;

const PartnerName = styled.Text` font-size: 16px; font-weight: 900; color: #0f172a; `;

const StatusRow = styled.View` flex-direction: row; align-items: center; margin-top: 1px; `;

const StatusDot = styled.View` width: 6px; height: 6px; border-radius: 3px; background-color: #16a34a; margin-right: 5px; `;

const StatusText = styled.Text` font-size: 9px; color: #16a34a; font-weight: 800; letter-spacing: 0.5px; `;

const Centered = styled.View` flex: 1; justify-content: center; `;

const BubbleContainer = styled.View` width: 100%; align-items: ${props => props.me ? 'flex-end' : 'flex-start'}; margin-bottom: 12px; `;

const Bubble = styled.View` 
  background: ${props => props.me ? '#15803d' : '#ffffff'}; 
  padding: 12px 16px; 
  border-radius: 20px; 
  border-bottom-right-radius: ${props => props.me ? '4px' : '20px'}; 
  border-bottom-left-radius: ${props => props.me ? '20px' : '4px'}; 
  max-width: 82%; 
  elevation: 2;
  shadow-opacity: 0.05;
  shadow-radius: 5px;
`;

const BubbleText = styled.Text` color: ${props => props.me ? '#ffffff' : '#1e293b'}; font-size: 15px; font-weight: 600; line-height: 22px; `;

const MetaRow = styled.View` flex-direction: row; align-self: flex-end; align-items: center; gap: 5px; margin-top: 5px; `;

const Time = styled.Text` font-size: 10px; color: ${props => props.me ? 'rgba(255,255,255,0.7)' : '#94a3b8'}; font-weight: 700; `;

const InputAreaContainer = styled.View` padding: 15px 20px 35px; background: #ffffff; border-top-width: 1px; border-top-color: #f1f5f9; `;

const InputBox = styled.View` flex-direction: row; align-items: flex-end; background-color: #f8fafc; border-radius: 25px; border-width: 1.5px; border-color: #e2e8f0; padding: 5px 5px 5px 18px; `;

const StyledInput = styled.TextInput` flex: 1; min-height: 40px; max-height: 120px; font-size: 15px; color: #0f172a; padding-top: 10px; font-weight: 600; `;

const SendButton = styled.TouchableOpacity` background-color: #15803d; width: 44px; height: 44px; border-radius: 22px; justify-content: center; align-items: center; margin-left: 10px; elevation: 4; opacity: ${props => props.disabled ? 0.5 : 1}; `;

const EmptyBox = styled.View` padding: 40px; align-items: center; `;
const MessageText = styled.Text` text-align: center; color: #94a3b8; font-size: 13px; font-weight: 700; line-height: 20px; `;

export default ChatRoomScreen;