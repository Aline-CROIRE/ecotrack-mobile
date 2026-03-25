import React, { useState, useContext } from 'react';
import { Alert, ActivityIndicator, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('citizen'); // Default role
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleRegister = async () => {
    const { name, email, password, phone } = formData;
    if (!name || !email || !password || !phone) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        ...formData,
        role,
      });
      // Automatically log them in after registration
      login(response.data.token, response.data);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>Join EcoTrack</Title>
        <Subtitle>Create an account to start cleaning your community</Subtitle>

        <Label>I am a:</Label>
        <RoleContainer>
          <RoleButton 
            active={role === 'citizen'} 
            onPress={() => setRole('citizen')}
          >
            <RoleText active={role === 'citizen'}>Citizen</RoleText>
          </RoleButton>
          <RoleButton 
            active={role === 'collector'} 
            onPress={() => setRole('collector')}
          >
            <RoleText active={role === 'collector'}>Collector</RoleText>
          </RoleButton>
        </RoleContainer>

        <Input 
          placeholder="Full Name" 
          value={formData.name}
          onChangeText={(val) => setFormData({...formData, name: val})}
        />
        <Input 
          placeholder="Email Address" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(val) => setFormData({...formData, email: val})}
        />
        <Input 
          placeholder="Phone Number" 
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(val) => setFormData({...formData, phone: val})}
        />
        <Input 
          placeholder="Password (min 6 chars)" 
          secureTextEntry
          value={formData.password}
          onChangeText={(val) => setFormData({...formData, password: val})}
        />

        <Button onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Create Account</ButtonText>}
        </Button>

        <Footer onPress={() => navigation.navigate('Login')}>
          <FooterText>Already have an account? <BoldText>Login</BoldText></FooterText>
        </Footer>
      </ScrollView>
    </Container>
  );
};

// Styled Components
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #fff;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #2ECC71;
  margin-top: 20px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 30px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
`;

const RoleContainer = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`;

const RoleButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #2ECC71;
  background-color: ${props => props.active ? '#2ECC71' : 'transparent'};
  margin-right: ${props => props.active ? '5px' : '0px'};
  align-items: center;
`;

const RoleText = styled.Text`
  font-weight: bold;
  color: ${props => props.active ? '#fff' : '#2ECC71'};
`;

const Input = styled.TextInput`
  background-color: #f4f6f6;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const Button = styled.TouchableOpacity`
  background-color: #2ECC71;
  padding: 16px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const Footer = styled.TouchableOpacity`
  margin-top: 20px;
  margin-bottom: 40px;
`;

const FooterText = styled.Text`
  text-align: center;
  color: #7f8c8d;
`;

const BoldText = styled.Text`
  color: #2ECC71;
  font-weight: bold;
`;

export default RegisterScreen;