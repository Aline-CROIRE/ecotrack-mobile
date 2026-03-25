import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Send, ChevronLeft } from 'lucide-react-native';

const ChatScreen = ({ route, navigation }) => {
  // Use a fallback name if none is passed
  const recipientName = route.params?.recipientName || "Eco Support";
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: `Hi! I'm ${recipientName}. How can I help you today?`, sender: 'other' },
    { id: '2', text: 'I wanted to check the status of my pickup.', sender: 'me' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage = { 
      id: Date.now().toString(), 
      text: message, 
      sender: 'me' 
    };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  // Safe Navigation back
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <Header>
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <ChevronLeft color="#0f172a" size={32} />
          </BackButton>
          <HeaderTitle numberOfLines={1}>{recipientName}</HeaderTitle>
          <View style={{ width: 40 }} /> 
        </Header>
      </SafeAreaView>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Bubble me={item.sender === 'me'}>
            <BubbleText me={item.sender === 'me'}>{item.text}</BubbleText>
          </Bubble>
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      <InputArea>
        <StyledInput 
          placeholder="Type a message..." 
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
          multiline={false}
        />
        <SendButton onPress={sendMessage} activeOpacity={0.8}>
          <Send color="#fff" size={20} />
        </SendButton>
      </InputArea>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM DARK EMERALD THEME) ---

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px 15px;
  border-bottom-width: 1px;
  border-bottom-color: #f1f5f9;
  background-color: #fff;
`;

const BackButton = styled.TouchableOpacity`
  padding: 10px;
  width: 50px;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  flex: 1;
  text-align: center;
`;

const Bubble = styled.View`
  align-self: ${props => props.me ? 'flex-end' : 'flex-start'};
  background: ${props => props.me ? '#15803d' : '#f1f5f9'};
  padding: 14px 18px;
  border-radius: 22px;
  border-bottom-right-radius: ${props => props.me ? '4px' : '22px'};
  border-bottom-left-radius: ${props => props.me ? '22px' : '4px'};
  margin-bottom: 12px;
  max-width: 85%;
  elevation: 1;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
`;

const BubbleText = styled.Text`
  color: ${props => props.me ? '#ffffff' : '#1e293b'};
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
`;

const InputArea = styled.View`
  flex-direction: row;
  padding: 12px 20px;
  padding-bottom: ${Platform.OS === 'ios' ? '30px' : '20px'};
  border-top-width: 1px;
  border-top-color: #f1f5f9;
  align-items: center;
  background-color: #fff;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 25px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  color: #0f172a;
  margin-right: 12px;
`;

const SendButton = styled.TouchableOpacity`
  background: #15803d;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  justify-content: center;
  align-items: center;
  elevation: 3;
`;

export default ChatScreen;