import React, { useState, useContext } from 'react';
import { 
  Alert, ActivityIndicator, KeyboardAvoidingView, 
  Platform, StatusBar, View, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Oops!', 'Please enter your email and password.');
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      login(response.data.token, response.data);
    } catch (error) {
      Alert.alert('Login Failed', 'The email or password you entered is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Background colors={['#064e3b', '#15803d', '#166534']} start={{x:0, y:0}} end={{x:1, y:1}}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 25 }}>
          
          <Header>
            <LogoWrapper>
                <Logo source={require('../../assets/logo.png')} resizeMode="contain" />
            </LogoWrapper>
            <Title>EcoTrack</Title>
            <Subtitle>Making our city cleaner, together.</Subtitle>
          </Header>

          <FormContainer>
            <InputGroup>
                <Mail color="rgba(255,255,255,0.7)" size={20} />
                <StyledInput 
                    placeholder="Email address" 
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email} 
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
            </InputGroup>

            <InputGroup>
                <Lock color="rgba(255,255,255,0.7)" size={20} />
                <StyledInput 
                    placeholder="Password" 
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={!showPassword} // Toggle visibility
                    value={password} 
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? 
                        <EyeOff color="rgba(255,255,255,0.7)" size={20} /> : 
                        <Eye color="rgba(255,255,255,0.7)" size={20} />
                    }
                </TouchableOpacity>
            </InputGroup>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                <LoginButton>
                    {loading ? <ActivityIndicator color="#15803d" /> : (
                        <>
                            <BtnText>SIGN IN</BtnText>
                            <ArrowRight color="#15803d" size={20} />
                        </>
                    )}
                </LoginButton>
            </TouchableOpacity>

            <Footer onPress={() => navigation.navigate('Register')}>
                <FooterText>New to EcoTrack? <BoldText>Create an account</BoldText></FooterText>
            </Footer>
          </FormContainer>

    

        </SafeAreaView>
      </Background>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(KeyboardAvoidingView)` flex: 1; `;
const Background = styled(LinearGradient)` flex: 1; `;
const Header = styled.View` align-items: center; margin-bottom: 40px; `;
const LogoWrapper = styled.View` background: rgba(255,255,255,0.1); padding: 15px; borderRadius: 25px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 15px; `;
const Logo = styled.Image` width: 60px; height: 60px; `;
const Title = styled.Text` color: #fff; font-size: 32px; font-weight: 900; letter-spacing: 2px; `;
const Subtitle = styled.Text` color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 600; margin-top: 5px; `;
const FormContainer = styled.View` background: rgba(255,255,255,0.12); padding: 30px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); `;
const InputGroup = styled.View` flex-direction: row; align-items: center; background: rgba(0,0,0,0.25); border-radius: 15px; padding: 12px 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1); `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; color: #fff; font-size: 15px; font-weight: 600; `;
const LoginButton = styled.View` background: #fff; padding: 18px; border-radius: 15px; flex-direction: row; justify-content: center; align-items: center; gap: 10px; margin-top: 10px; `;
const BtnText = styled.Text` color: #15803d; font-size: 15px; font-weight: 900; letter-spacing: 1px; `;
const Footer = styled.TouchableOpacity` margin-top: 25px; `;
const FooterText = styled.Text` text-align: center; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 600; `;
const BoldText = styled.Text` color: #fff; font-weight: 900; `;
const SystemBadge = styled.View` flex-direction: row; align-items: center; justify-content: center; gap: 8px; margin-top: 40px; `;
const SystemText = styled.Text` color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 800; letter-spacing: 1px; `;

export default LoginScreen;