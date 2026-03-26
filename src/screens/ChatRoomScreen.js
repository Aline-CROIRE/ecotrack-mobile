import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FlatList, KeyboardAvoidingView, Platform, View, 
  ActivityIndicator, TouchableOpacity, TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Send, ChevronLeft, Phone, CheckCheck } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatRoomScreen = ({ route, navigation }) => {
  const { partner } = route.params;
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  const fetchMessages = async () => {
    if (!partner?.id) return;
    try {
      const res = await apiClient.get(`/messages/${partner.id}`);
      setMessages(res.data.data);
    } catch (e) { console.log("Fetch Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) { console.log("Send Error"); }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <HeaderWrapper>
        <SafeAreaView edges={['top']}>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                <ChevronLeft color="#0f172a" size={28} />
            </TouchableOpacity>
            <HeaderInfo>
                <PartnerName numberOfLines={1}>{partner.name}</PartnerName>
                <StatusRow><StatusDot /><StatusText>{(partner.role || 'User').toUpperCase()}</StatusText></StatusRow>
            </HeaderInfo>
            <TouchableOpacity style={{ padding: 10 }}><Phone color="#15803d" size={22} /></TouchableOpacity>
          </Header>
        </SafeAreaView>
      </HeaderWrapper>

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
                        {item.sender === user._id && <CheckCheck size={12} color="rgba(255,255,255,0.6)" />}
                    </MetaRow>
                </Bubble>
            </BubbleContainer>
          )}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      <InputAreaContainer>
        <InputBox>
          <StyledInput 
            placeholder="Type a message..." 
            value={message} 
            onChangeText={setMessage} 
            multiline
          />
          <SendButton onPress={sendMessage} disabled={!message.trim()}>
            <Send color="#fff" size={20} />
          </SendButton>
        </InputBox>
      </InputAreaContainer>
    </Container>
  );
};

// --- STYLED COMPONENTS (SMS UPGRADE) ---
const Container = styled(KeyboardAvoidingView)` flex: 1; background: #f4f7f6; `;
const HeaderWrapper = styled.View` background: #fff; border-bottom-width: 1px; border-bottom-color: #e2e8f0; elevation: 3; `;
const Header = styled.View` flex-direction: row; align-items: center; justify-content: space-between; padding: 5px 10px; `;
const HeaderInfo = styled.View` flex: 1; align-items: center; `;
const PartnerName = styled.Text` font-size: 16px; font-weight: 800; color: #0f172a; `;
const StatusRow = styled.View` flex-direction: row; align-items: center; margin-top: 2px; `;
const StatusDot = styled.View` width: 6px; height: 6px; border-radius: 3px; background: #16a34a; margin-right: 5px; `;
const StatusText = styled.Text` font-size: 10px; color: #64748b; font-weight: 700; `;
const Centered = styled.View` flex: 1; justify-content: center; `;

const BubbleContainer = styled.View` width: 100%; align-items: ${props => props.me ? 'flex-end' : 'flex-start'}; margin-bottom: 8px; `;
const Bubble = styled.View` 
  background: ${props => props.me ? '#15803d' : '#ffffff'}; 
  padding: 10px 14px; 
  border-radius: 18px; 
  border-bottom-right-radius: ${props => props.me ? '2px' : '18px'}; 
  border-bottom-left-radius: ${props => props.me ? '18px' : '2px'}; 
  max-width: 80%; 
  elevation: 1;
`;
const BubbleText = styled.Text` color: ${props => props.me ? '#fff' : '#1e293b'}; font-size: 15px; line-height: 20px; `;
const MetaRow = styled.View` flex-direction: row; align-self: flex-end; align-items: center; gap: 4px; margin-top: 4px; `;
const Time = styled.Text` font-size: 9px; color: ${props => props.me ? 'rgba(255,255,255,0.6)' : '#94a3b8'}; font-weight: 700; `;

const InputAreaContainer = styled.View` padding: 12px 15px 30px; background: #fff; border-top-width: 1px; border-top-color: #e2e8f0; `;
const InputBox = styled.View` flex-direction: row; align-items: flex-end; background: #f8fafc; border-radius: 25px; border: 1px solid #e2e8f0; padding: 5px 5px 5px 15px; `;
const StyledInput = styled.TextInput` flex: 1; min-height: 40px; max-height: 100px; font-size: 15px; padding-top: 10px; `;
const SendButton = styled.TouchableOpacity` background: #15803d; width: 40px; height: 40px; border-radius: 20px; justify-content: center; align-items: center; margin-left: 10px; opacity: ${props => props.disabled ? 0.5 : 1}; `;

export default ChatRoomScreen;