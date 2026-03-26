import React, { useState, useContext } from 'react';
import { 
  ScrollView, 
  View, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { 
  ChevronLeft, 
  User, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ReportDetailScreen = ({ route, navigation }) => {
  const { report } = route.params;
  const { user } = useContext(AuthContext);
  
  const [status, setStatus] = useState(report?.status || 'open');
  const [loading, setLoading] = useState(false);

  // Logic Constants
  const isAdmin = user?.role === 'admin';
  const isMyReport = report?.citizen?._id === user?._id;

  /**
   * ADMIN ACTION: Resolve the incident
   */
  const updateReportStatus = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/reports/${report._id}/status`, { status: newStatus });
      setStatus(newStatus);
      Alert.alert("Mission Complete", `Incident has been marked as ${newStatus.toUpperCase()}`);
    } catch (e) {
      Alert.alert("Update Failed", "Could not connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper: Get color based on status
   */
  const getStatusColor = (currentStatus) => {
    if (currentStatus === 'resolved') return '#16a34a';
    if (currentStatus === 'in-review') return '#ca8a04';
    return '#dc2626';
  };

  return (
    <Container>
      {/* HEADER */}
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <ChevronLeft color="#0f172a" size={28} />
        </TouchableOpacity>
        <Title>Report Analysis</Title>
        <View style={{ width: 33 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* EVIDENCE IMAGE */}
        <EvidenceImage 
          source={report.imageUrl ? { uri: report.imageUrl } : require('../../assets/logo.png')} 
          resizeMode={report.imageUrl ? "cover" : "contain"}
        />
        
        <Content>
          {/* STATUS & DATE BAR */}
          <BadgeRow>
            <StatusBadge bg={getStatusColor(status) + '15'}>
              <StatusDot color={getStatusColor(status)} />
              <StatusText color={getStatusColor(status)}>{status.toUpperCase()}</StatusText>
            </StatusBadge>
            <DateRow>
              <Calendar size={14} color="#94a3b8" />
              <DateText>{new Date(report.createdAt).toLocaleDateString()}</DateText>
            </DateRow>
          </BadgeRow>

          {/* REPORT BODY */}
          <ReportTitle>{report.title}</ReportTitle>
          <Description>{report.description}</Description>

          <Divider />

          {/* REPORTER INFORMATION */}
          <SectionLabel>Involved Party</SectionLabel>
          <UserCard>
            <Avatar bg={isMyReport ? '#15803d' : '#0f172a'}>
              <User color="#fff" size={24} />
            </Avatar>
            <UserInfo>
              <Name>{isMyReport ? "You (Reporter)" : report.citizen?.name}</Name>
              <Sub>{(report.citizen?.role || 'User').toUpperCase()} • {report.citizen?.email}</Sub>
            </UserInfo>

            {/* LOGIC: Only show chat if the viewer is NOT the person who wrote the report */}
            {!isMyReport && (
                <ChatBtn 
                  onPress={() => navigation.navigate('ChatRoom', { 
                    partner: { ...report.citizen, id: report.citizen?._id } 
                  })}
                  activeOpacity={0.7}
                >
                    <MessageCircle color="#fff" size={20} />
                </ChatBtn>
            )}
          </UserCard>

          {/* ADMIN ACTION PANEL */}
          {isAdmin && status !== 'resolved' && (
            <AdminActions>
                <ResolveBtn onPress={() => updateReportStatus('resolved')} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                          <CheckCircle2 color="#fff" size={22} />
                          <BtnText>Resolve Incident</BtnText>
                        </>
                    )}
                </ResolveBtn>
                <ActionHint>Resolving this will notify the reporter and close the ticket.</ActionHint>
            </AdminActions>
          )}

          {/* SUCCESS MESSAGE FOR CITIZEN */}
          {isMyReport && status === 'resolved' && (
              <SuccessCard>
                  <CheckCircle2 color="#16a34a" size={24} />
                  <SuccessText>This issue has been resolved by the City Administration. Thank you for your contribution!</SuccessText>
              </SuccessCard>
          )}
        </Content>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (WORLD-CLASS DESIGN) ---

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f1f5f9;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
`;

const EvidenceImage = styled.Image`
  width: 100%;
  height: 280px;
  background-color: #f8fafc;
`;

const Content = styled.View`
  padding: 25px;
  background-color: #fff;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-top: -30px;
`;

const BadgeRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.bg};
  padding: 6px 14px;
  border-radius: 10px;
  gap: 6px;
`;

const StatusDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const StatusText = styled.Text`
  font-size: 11px;
  font-weight: 900;
  color: ${props => props.color};
  letter-spacing: 0.5px;
`;

const DateRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const DateText = styled.Text`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 700;
`;

const ReportTitle = styled.Text`
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 15px;
  color: #475569;
  line-height: 24px;
  margin-bottom: 30px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #f1f5f9;
  margin-bottom: 25px;
`;

const SectionLabel = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const UserCard = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f8fafc;
  padding: 18px;
  border-radius: 22px;
  border-width: 1px;
  border-color: #f1f5f9;
`;

const Avatar = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.bg};
  justify-content: center;
  align-items: center;
`;

const UserInfo = styled.View`
  flex: 1;
  margin-left: 15px;
`;

const Name = styled.Text`
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
`;

const Sub = styled.Text`
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  font-weight: 600;
`;

const ChatBtn = styled.TouchableOpacity`
  background-color: #15803d;
  padding: 14px;
  border-radius: 14px;
  elevation: 3;
`;

const AdminActions = styled.View`
  margin-top: 40px;
  margin-bottom: 40px;
`;

const ResolveBtn = styled.TouchableOpacity`
  background-color: #16a34a;
  padding: 20px;
  border-radius: 18px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
  elevation: 5;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
`;

const BtnText = styled.Text`
  color: #fff;
  font-weight: 900;
  font-size: 17px;
`;

const ActionHint = styled.Text`
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 12px;
  font-weight: 600;
`;

const SuccessCard = styled.View`
  background-color: #f0fdf4;
  padding: 20px;
  border-radius: 18px;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  border-width: 1px;
  border-color: #dcfce7;
  margin-top: 10px;
`;

const SuccessText = styled.Text`
  flex: 1;
  color: #16a34a;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
`;

export default ReportDetailScreen;