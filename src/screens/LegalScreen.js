import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';

const LegalScreen = ({ navigation }) => (
  <Container>
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }} />
    <Header>
      <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" size={28} /></TouchableOpacity>
      <Title>Legal & Privacy</Title>
      <View style={{ width: 28 }} />
    </Header>
    <ScrollView contentContainerStyle={{ padding: 25 }}>
        <IconBox><ShieldCheck color="#15803d" size={40} /></IconBox>
        <LegalTitle>Terms of Service</LegalTitle>
        <LegalText>By using EcoTrack, you agree to provide accurate location data for waste collection. System abuse or false reporting will lead to account suspension...</LegalText>
        
        <LegalTitle style={{ marginTop: 30 }}>Privacy Policy</LegalTitle>
        <LegalText>We secure your personal information using industry-standard encryption. Your location is only shared with authorized collectors during active mission hours...</LegalText>
    </ScrollView>
  </Container>
);

const Container = styled.View` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; `;
const IconBox = styled.View` align-self: center; background: #f0fdf4; padding: 20px; border-radius: 40px; margin-bottom: 20px; `;
const LegalTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 10px; `;
const LegalText = styled.Text` font-size: 14px; color: #64748b; line-height: 22px; font-weight: 500; `;

export default LegalScreen;