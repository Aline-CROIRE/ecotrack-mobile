import React, { useState, useContext } from 'react';
import { 
  Alert, ActivityIndicator, KeyboardAvoidingView, 
  Platform, StatusBar, ScrollView, TouchableOpacity, View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Lock, ChevronLeft, UserCheck, Eye, EyeOff } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

const RegisterScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      return Alert.alert('Missing Information', 'Please fill out all the fields to create your account.');
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { ...form, role });
      login(response.data.token, response.data);
    } catch (error) {
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Background colors={['#064e3b', '#15803d']} start={{x:0, y:0}} end={{x:1, y:1}}>
        <SafeAreaView style={{ flex: 1 }}>
          
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                <ChevronLeft color="#fff" size={32} />
            </TouchableOpacity>
            <HeaderTitle>Join EcoTrack</HeaderTitle>
            <View style={{ width: 45 }} />
          </Header>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 25 }}>
            
            <SectionLabel>I WANT TO JOIN AS A:</SectionLabel>
            <RoleRow>
                <RoleCard active={role === 'citizen'} onPress={() => setRole('citizen')}>
                    <User color={role === 'citizen' ? '#fff' : 'rgba(255,255,255,0.4)'} size={24} />
                    <RoleLabel active={role === 'citizen'}>CITIZEN</RoleLabel>
                </RoleCard>
                <RoleCard active={role === 'collector'} onPress={() => setRole('collector')}>
                    <UserCheck color={role === 'collector' ? '#fff' : 'rgba(255,255,255,0.4)'} size={24} />
                    <RoleLabel active={role === 'collector'}>COLLECTOR</RoleLabel>
                </RoleCard>
            </RoleRow>

            <FormBody>
                <InputGroup>
                    <User color="rgba(255,255,255,0.6)" size={20} />
                    <StyledInput 
                        placeholder="Your full name"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={form.name}
                        onChangeText={(val) => setForm({...form, name: val})}
                    />
                </InputGroup>

                <InputGroup>
                    <Mail color="rgba(255,255,255,0.6)" size={20} />
                    <StyledInput 
                        placeholder="Email address"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(val) => setForm({...form, email: val})}
                    />
                </InputGroup>

                <InputGroup>
                    <Phone color="rgba(255,255,255,0.6)" size={20} />
                    <StyledInput 
                        placeholder="Phone number"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={(val) => setForm({...form, phone: val})}
                    />
                </InputGroup>

                <InputGroup>
                    <Lock color="rgba(255,255,255,0.6)" size={20} />
                    <StyledInput 
                        placeholder="Create a password"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        secureTextEntry={!showPassword}
                        value={form.password}
                        onChangeText={(val) => setForm({...form, password: val})}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? 
                            <EyeOff color="rgba(255,255,255,0.7)" size={20} /> : 
                            <Eye color="rgba(255,255,255,0.7)" size={20} />
                        }
                    </TouchableOpacity>
                </InputGroup>

                <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                    <SubmitButton>
                        {loading ? <ActivityIndicator color="#15803d" /> : <SubmitText>SIGN UP</SubmitText>}
                    </SubmitButton>
                </TouchableOpacity>
            </FormBody>

            <Footer onPress={() => navigation.navigate('Login')}>
                <FooterText>Already have an account? <BoldText>Sign In</BoldText></FooterText>
            </Footer>

          </ScrollView>
        </SafeAreaView>
      </Background>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(KeyboardAvoidingView)` flex: 1; `;
const Background = styled(LinearGradient)` flex: 1; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 10px; `;
const HeaderTitle = styled.Text` color: #fff; font-size: 20px; font-weight: 800; `;
const SectionLabel = styled.Text` font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-align: center; margin-bottom: 20px; `;
const RoleRow = styled.View` flex-direction: row; gap: 15px; margin-bottom: 30px; `;
const RoleCard = styled.TouchableOpacity` flex: 1; background: ${props => props.active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'}; border-radius: 20px; padding: 20px; align-items: center; border: 1px solid ${props => props.active ? '#fff' : 'transparent'}; `;
const RoleLabel = styled.Text` color: ${props => props.active ? '#fff' : 'rgba(255,255,255,0.4)'}; font-size: 10px; font-weight: 900; margin-top: 10px; `;
const FormBody = styled.View` background: rgba(255,255,255,0.12); padding: 25px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); `;
const InputGroup = styled.View` flex-direction: row; align-items: center; background: rgba(0,0,0,0.25); border-radius: 15px; padding: 12px 15px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; color: #fff; font-size: 15px; font-weight: 600; `;
const SubmitButton = styled.View` background: #fff; padding: 18px; border-radius: 15px; align-items: center; margin-top: 10px; `;
const SubmitText = styled.Text` color: #15803d; font-size: 15px; font-weight: 900; letter-spacing: 1px; `;
const Footer = styled.TouchableOpacity` margin-top: 30px; margin-bottom: 40px; `;
const FooterText = styled.Text` text-align: center; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 600; `;
const BoldText = styled.Text` color: #fff; font-weight: 900; `;

export default RegisterScreen;