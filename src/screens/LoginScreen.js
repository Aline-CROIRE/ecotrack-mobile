import React, { useState, useContext } from 'react';
import { Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      login(response.data.token, response.data);
    } catch (error) {
      Alert.alert('Login Failed', 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BackgroundGradient colors={['#064E3B', '#15803d']} start={{x: 0, y: 0}} end={{x: 0, y: 1}}>
        <HeaderContainer>
          <LogoContainer>
            <Logo source={require('../../assets/logo.png')} />
          </LogoContainer>
          <Title>EcoTrack</Title>
          <Tagline>Smart Waste. Cleaner Future.</Tagline>
        </HeaderContainer>

        <FormContainer>
          <InputLabel>Email Address</InputLabel>
          <Input 
            placeholder="e.g. citizen@ecotrack.com" 
            placeholderTextColor="#94a3b8"
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          
          <InputLabel>Password</InputLabel>
          <Input 
            placeholder="••••••••" 
            placeholderTextColor="#94a3b8"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <LoginButton onPress={handleLogin} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Sign In</ButtonText>}
          </LoginButton>

          <Footer onPress={() => navigation.navigate('Register')}>
            <FooterText>New here? <BoldText>Create an account</BoldText></FooterText>
          </Footer>
        </FormContainer>
      </BackgroundGradient>
    </Container>
  );
};

const Container = styled.KeyboardAvoidingView` flex: 1; `;
const BackgroundGradient = styled(LinearGradient)` flex: 1; justifyContent: center; padding: 20px; `;
const HeaderContainer = styled.View` alignItems: center; marginBottom: 40px; `;
const LogoContainer = styled.View` padding: 15px; backgroundColor: rgba(255,255,255,0.15); borderRadius: 25px; marginBottom: 20px; `;
const Logo = styled.Image` width: 70px; height: 70px; `;
const Title = styled.Text` color: #fff; fontSize: 32px; fontWeight: 900; letterSpacing: 1px; `;
const Tagline = styled.Text` color: #D1FAE5; fontSize: 16px; marginTop: 5px; fontWeight: 500; `;
const FormContainer = styled.View` backgroundColor: #fff; padding: 30px; borderRadius: 30px; elevation: 10; `;
const InputLabel = styled.Text` fontSize: 13px; fontWeight: 700; color: #374151; marginBottom: 8px; textTransform: uppercase; `;
const Input = styled.TextInput` backgroundColor: #F8FAFC; padding: 16px; borderRadius: 15px; marginBottom: 20px; fontSize: 16px; color: #1e293b; border: 1px solid #e2e8f0; `;
const LoginButton = styled.TouchableOpacity` backgroundColor: #15803d; padding: 18px; borderRadius: 15px; alignItems: center; marginTop: 10px; `;
const ButtonText = styled.Text` color: #fff; fontSize: 18px; fontWeight: 700; `;
const Footer = styled.TouchableOpacity` marginTop: 25px; `;
const FooterText = styled.Text` textAlign: center; color: #64748b; fontSize: 14px; `;
const BoldText = styled.Text` color: #15803d; fontWeight: 700; `;

export default LoginScreen;