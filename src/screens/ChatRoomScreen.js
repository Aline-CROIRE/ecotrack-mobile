import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Send, ChevronLeft, Phone, MoreVertical } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ChatRoomScreen = ({ route, navigation }) => {
  const { partner } = route.params; // { id, name, role }
  const { user } = useContext(AuthContext); // My own user data
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  /**
   * 1. FETCH MESSAGES
   * Gets the conversation history between me and the partner
   */
  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/messages/${partner.id}`);
      setMessages(res.data.data);
    } catch (e) {
      console.log("Chat Fetch Error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. REAL-TIME POLLING
   * Checks for new messages from the other person every 4 seconds
   */
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 3. SEND MESSAGE
   * Persists the message to the database and updates UI
   */
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const content = message;
    setMessage(''); // Clear input instantly for better UX

    try {
      const res = await apiClient.post('/messages', {
        recipientId: partner.id,
        content: content
      });
      // Add the new message to our local list immediately
      setMessages(prev => [...prev, res.data.data]);
      
      // Small delay to ensure the list has rendered the new item
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.log("Send Error:", e.message);
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      
      {/* HEADER SECTION */}
      <HeaderWrapper>
        <SafeAreaView edges={['top']}>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                <ChevronLeft color="#0f172a" size={28} />
            </TouchableOpacity>
            
            <HeaderInfo>
                <PartnerName numberOfLines={1}>{partner.name}</PartnerName>
                <StatusRow>
                    <StatusDot />
                    <StatusText>{(partner.role || 'Member').toUpperCase()}</StatusText>
                </StatusRow>
            </HeaderInfo>

            <TouchableOpacity style={{ padding: 10 }}>
                <Phone color="#15803d" size={22} />
            </TouchableOpacity>
          </Header>
        </SafeAreaView>
      </HeaderWrapper>

      {/* MESSAGES LIST */}
      {loading ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Bubble me={item.sender === user._id}>
              <BubbleText me={item.sender === user._id}>{item.content}</BubbleText>
              <Timestamp me={item.sender === user._id}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Timestamp>
            </Bubble>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* INPUT AREA */}
      <InputAreaContainer>
        <InputBox>
          <StyledInput 
            placeholder="Type a message..." 
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <SendButton onPress={sendMessage} activeOpacity={0.8} disabled={!message.trim()}>
            <Send color="#fff" size={20} />
          </SendButton>
        </InputBox>
      </InputAreaContainer>

    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM EMERALD THEME) ---

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: #ffffff;
`;

const HeaderWrapper = styled.View`
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #f1f5f9;
  elevation: 2;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
`;

const HeaderInfo = styled.View`
  flex: 1;
  align-items: center;
`;

const PartnerName = styled.Text`
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
`;

const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
`;

const StatusDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #16a34a;
  margin-right: 5px;
`;

const StatusText = styled.Text`
  font-size: 10px;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Bubble = styled.View`
  align-self: ${props => props.me ? 'flex-end' : 'flex-start'};
  background: ${props => props.me ? '#15803d' : '#f1f5f9'};
  padding: 12px 16px;
  border-radius: 20px;
  border-bottom-right-radius: ${props => props.me ? '4px' : '20px'};
  border-bottom-left-radius: ${props => props.me ? '20px' : '4px'};
  margin-bottom: 15px;
  max-width: 80%;
  elevation: 1;
`;

const BubbleText = styled.Text`
  color: ${props => props.me ? '#ffffff' : '#1e293b'};
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
`;

const Timestamp = styled.Text`
  font-size: 9px;
  color: ${props => props.me ? 'rgba(255,255,255,0.7)' : '#94a3b8'};
  align-self: flex-end;
  margin-top: 4px;
  font-weight: 600;
`;

const InputAreaContainer = styled.View`
  padding: 15px 20px;
  padding-bottom: ${Platform.OS === 'ios' ? '35px' : '20px'};
  background-color: #ffffff;
  border-top-width: 1px;
  border-top-color: #f1f5f9;
`;

const InputBox = styled.View`
  flex-direction: row;
  align-items: flex-end;
  background-color: #f8fafc;
  border-radius: 25px;
  border-width: 1px;
  border-color: #e2e8f0;
  padding: 5px 5px 5px 15px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  min-height: 40px;
  max-height: 100px;
  font-size: 15px;
  color: #0f172a;
  padding-top: 10px;
`;

const SendButton = styled.TouchableOpacity`
  background-color: #15803d;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

export default ChatRoomScreen;