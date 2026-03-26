import React, { useState, useContext } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, User, MessageCircle, CheckCircle2, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ReportDetailScreen = ({ route, navigation }) => {
  const { report } = route.params;
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(report.status);
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role === 'admin';
  // Check if I am the one who made this report
  const isMyReport = report.citizen?._id === user._id;

  const updateReportStatus = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/reports/${report._id}/status`, { status: newStatus });
      setStatus(newStatus);
      Alert.alert("Mission Update", `Incident status is now: ${newStatus.toUpperCase()}`);
    } catch (e) { Alert.alert("Error", "Server failed to update"); }
    finally { setLoading(false); }
  };

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" size={28} /></TouchableOpacity>
        <Title>Incident Analysis</Title>
        <View style={{ width: 28 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <EvidenceImage source={report.imageUrl ? { uri: report.imageUrl } : require('../../assets/logo.png')} />
        
        <Content>
          <BadgeRow>
            <StatusBadge status={status}><StatusText status={status}>{status.toUpperCase()}</StatusText></StatusBadge>
            <TimeText>{new Date(report.createdAt).toLocaleDateString()}</TimeText>
          </BadgeRow>

          <ReportTitle>{report.title}</ReportTitle>
          <Description>{report.description}</Description>

          <Divider />

          <SectionLabel>Involved Party (Reporter)</SectionLabel>
          <UserCard>
            <Avatar><User color="#fff" size={20} /></Avatar>
            <UserInfo>
              <Name>{isMyReport ? "You (Reporter)" : report.citizen?.name}</Name>
              <Sub>{report.citizen?.role?.toUpperCase()} • {report.citizen?.email}</Sub>
            </UserInfo>

            {/* PREVENT CHATTING WITH SELF: Only show Chat if the viewer is NOT the reporter */}
            {!isMyReport && (
                <ChatBtn onPress={() => navigation.navigate('ChatRoom', { partner: { ...report.citizen, id: report.citizen?._id } })}>
                    <MessageCircle color="#fff" size={20} />
                </ChatBtn>
            )}
          </UserCard>

          {/* ADMIN ONLY ACTIONS */}
          {isAdmin && status !== 'resolved' && (
            <AdminActions>
                <ResolveBtn onPress={() => updateReportStatus('resolved')} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <><CheckCircle2 color="#fff" size={20} /><BtnText>Close & Resolve Issue</BtnText></>
                    )}
                </ResolveBtn>
            </AdminActions>
          )}

          {/* CITIZEN MESSAGE (If they are viewing their own resolved report) */}
          {isMyReport && status === 'resolved' && (
              <SuccessMsg>This issue has been successfully resolved by the City Admin.</SuccessMsg>
          )}
        </Content>
      </ScrollView>
    </Container>
  );
};

const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; `;
const EvidenceImage = styled.Image` width: 100%; height: 250px; background: #f8fafc; `;
const Content = styled.View` padding: 25px; `;
const BadgeRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const StatusBadge = styled.View` background: ${props => props.status === 'resolved' ? '#dcfce7' : '#fee2e2'}; padding: 6px 12px; border-radius: 8px; `;
const StatusText = styled.Text` font-size: 10px; font-weight: 800; color: ${props => props.status === 'resolved' ? '#16a34a' : '#ef4444'}; `;
const TimeText = styled.Text` color: #94a3b8; font-size: 12px; font-weight: 700; `;
const ReportTitle = styled.Text` font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; `;
const Description = styled.Text` font-size: 15px; color: #475569; line-height: 22px; margin-bottom: 30px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 800; color: #94a3b8; margin-bottom: 15px; text-transform: uppercase; `;
const UserCard = styled.View` flex-direction: row; align-items: center; background: #f8fafc; padding: 15px; border-radius: 20px; border: 1px solid #f1f5f9; `;
const Avatar = styled.View` width: 44px; height: 44px; border-radius: 22px; background: #0f172a; justify-content: center; align-items: center; `;
const UserInfo = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-weight: 700; font-size: 15px; color: #1e293b; `;
const Sub = styled.Text` font-size: 11px; color: #64748b; `;
const ChatBtn = styled.TouchableOpacity` background: #15803d; padding: 12px; border-radius: 12px; `;
const AdminActions = styled.View` margin-top: 30px; margin-bottom: 40px; `;
const ResolveBtn = styled.TouchableOpacity` background: #16a34a; padding: 18px; border-radius: 15px; flex-direction: row; justify-content: center; align-items: center; gap: 10px; `;
const BtnText = styled.Text` color: #fff; font-weight: 800; font-size: 16px; `;
const Divider = styled.View` height: 1px; background: #f1f5f9; margin-bottom: 25px; `;
const SuccessMsg = styled.Text` background: #f0fdf4; color: #16a34a; padding: 15px; border-radius: 12px; text-align: center; font-weight: 700; margin-top: 20px; `;

export default ReportDetailScreen;