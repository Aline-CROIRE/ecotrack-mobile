import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, MessageCircle, HelpCircle, FileText, Info } from 'lucide-react-native';

const SupportScreen = ({ navigation }) => {
  const faqs = [
    { q: "How do I request a pickup?", a: "Go to Home and click 'Request Pickup'. Drop your GPS pin and submit." },
    { q: "When will my waste be collected?", a: "Check the 'Activity' tab. Once assigned, you will see your collector's details." },
    { q: "How to report illegal dumping?", a: "Use the 'Reports' tab and click the plus icon to file an incident." }
  ];

  return (
    <Container>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }} />
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" size={28} /></TouchableOpacity>
        <Title>Support Center</Title>
        <View style={{ width: 28 }} />
      </Header>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <ActionCard onPress={() => navigation.navigate('ChatList')}>
            <MessageCircle color="#fff" size={30} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <CardTitle>Chat with Support</CardTitle>
                <CardSub>Get help from an administrator now</CardSub>
            </View>
        </ActionCard>

        <SectionLabel>Frequently Asked Questions</SectionLabel>
        {faqs.map((f, i) => (
            <FaqItem key={i}>
                <Question>{f.q}</Question>
                <Answer>{f.a}</Answer>
            </FaqItem>
        ))}
      </ScrollView>
    </Container>
  );
};

const Container = styled.View` flex: 1; background: #f8fafc; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; `;
const ActionCard = styled.TouchableOpacity` background: #0f172a; padding: 25px; border-radius: 20px; flex-direction: row; align-items: center; margin-bottom: 30px; `;
const CardTitle = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;
const CardSub = styled.Text` color: rgba(255,255,255,0.6); font-size: 12px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 900; color: #cbd5e1; margin-bottom: 20px; `;
const FaqItem = styled.View` background: #fff; padding: 20px; border-radius: 15px; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const Question = styled.Text` font-weight: 800; color: #0f172a; `;
const Answer = styled.Text` color: #64748b; font-size: 13px; margin-top: 8px; line-height: 20px; `;

export default SupportScreen;