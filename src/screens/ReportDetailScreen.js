import React, { useState, useContext } from 'react';
import { 
  ScrollView, 
  View, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { 
  ChevronLeft, User, MessageCircle, CheckCircle2, 
  Search, Clock, AlertCircle, Calendar 
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const ReportDetailScreen = ({ route, navigation }) => {
  const { report } = route.params;
  const { user } = useContext(AuthContext);
  
  const [status, setStatus] = useState(report?.status || 'open');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isMyReport = report?.citizen?._id === user?._id;

  /**
   * SMART STATUS UPDATE
   * Moves the report through the lifecycle: Open -> In-Review -> Resolved
   */
  const updateReportStatus = async (newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/reports/${report._id}/status`, { status: newStatus });
      setStatus(newStatus);
      
      const msg = newStatus === 'in-review' 
        ? "Report is now under investigation." 
        : "Incident has been resolved.";
        
      Alert.alert("Control Center", msg);
    } catch (e) {
      Alert.alert("Sync Error", "Could not update status. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (currentStatus) => {
    if (currentStatus === 'resolved') return { color: '#16a34a', bg: '#dcfce7', label: 'RESOLVED' };
    if (currentStatus === 'in-review') return { color: '#f59e0b', bg: '#fef3c7', label: 'IN REVIEW' };
    return { color: '#dc2626', bg: '#fee2e2', label: 'OPEN ISSUE' };
  };

  const cfg = getStatusConfig(status);

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* HEADER */}
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <ChevronLeft color="#0f172a" size={28} />
        </TouchableOpacity>
        <Title>Incident Analysis</Title>
        <View style={{ width: 33 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* EVIDENCE PHOTO */}
        <EvidenceImage 
          source={report.imageUrl ? { uri: report.imageUrl } : require('../../assets/logo.png')} 
          resizeMode={report.imageUrl ? "cover" : "contain"}
        />
        
        <Content>
          <BadgeRow>
            <StatusBadge bg={cfg.bg}>
              <StatusDot color={cfg.color} />
              <StatusText color={cfg.color}>{cfg.label}</StatusText>
            </StatusBadge>
            <DateRow>
              <Calendar size={14} color="#94a3b8" />
              <DateText>{new Date(report.createdAt).toLocaleDateString()}</DateText>
            </DateRow>
          </BadgeRow>

          <ReportTitle>{report.title}</ReportTitle>
          <Description>{report.description}</Description>

          <Divider />

          <SectionLabel>Involved Party</SectionLabel>
          <UserCard>
            <Avatar bg={isMyReport ? '#15803d' : '#0f172a'}>
              <User color="#fff" size={22} />
            </Avatar>
            <UserInfo>
              <Name>{isMyReport ? "You (Reporter)" : report.citizen?.name}</Name>
              <Sub>{(report.citizen?.role || 'user').toUpperCase()} • {report.citizen?.email}</Sub>
            </UserInfo>

            {!isMyReport && (
                <ChatBtn 
                  onPress={() => navigation.navigate('ChatRoom', { 
                    partner: { ...report.citizen, id: report.citizen?._id } 
                  })}
                >
                    <MessageCircle color="#fff" size={20} />
                </ChatBtn>
            )}
          </UserCard>

          {/* --- ADMIN DYNAMIC WORKFLOW PANEL --- */}
          {isAdmin && status !== 'resolved' && (
            <AdminPanel>
                <PanelTitle>Management Actions</PanelTitle>
                
                {status === 'open' ? (
                    // STEP 1: Move to Review
                    <MainActionBtn bg="#f59e0b" onPress={() => updateReportStatus('in-review')} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <><Search color="#fff" size={20} /><BtnText>Start Official Review</BtnText></>
                        )}
                    </MainActionBtn>
                ) : (
                    // STEP 2: Move to Resolved
                    <MainActionBtn bg="#16a34a" onPress={() => updateReportStatus('resolved')} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <><CheckCircle2 color="#fff" size={20} /><BtnText>Mark as Resolved</BtnText></>
                        )}
                    </MainActionBtn>
                )}
                
                <ActionHint>
                    {status === 'open' 
                      ? "Mark this to let the user know you are investigating." 
                      : "Confirm that the issue has been cleared on-site."}
                </ActionHint>
            </AdminPanel>
          )}

          {/* STATUS FEEDBACK FOR CITIZENS */}
          {isMyReport && status === 'in-review' && (
              <ReviewInfo>
                  <Clock color="#f59e0b" size={20} />
                  <ReviewText>A city administrator is currently investigating this incident. We will notify you once it's resolved.</ReviewText>
              </ReviewInfo>
          )}

          {status === 'resolved' && (
              <SuccessCard>
                  <CheckCircle2 color="#16a34a" size={24} />
                  <SuccessText>This incident has been verified and resolved. The case is now closed.</SuccessText>
              </SuccessCard>
          )}
          
          <View style={{ height: 40 }} />
        </Content>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #ffffff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 20px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const EvidenceImage = styled.Image` width: 100%; height: 260px; background: #f8fafc; `;
const Content = styled.View` padding: 25px; background: #fff; border-top-left-radius: 30px; border-top-right-radius: 30px; margin-top: -30px; `;
const BadgeRow = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const StatusBadge = styled.View` flex-direction: row; align-items: center; background: ${props => props.bg}; padding: 6px 12px; border-radius: 10px; gap: 6px; `;
const StatusDot = styled.View` width: 6px; height: 6px; border-radius: 3px; background-color: ${props => props.color}; `;
const StatusText = styled.Text` font-size: 10px; font-weight: 900; color: ${props => props.color}; `;
const DateRow = styled.View` flex-direction: row; align-items: center; gap: 6px; `;
const DateText = styled.Text` font-size: 12px; color: #94a3b8; font-weight: 700; `;
const ReportTitle = styled.Text` font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 10px; `;
const Description = styled.Text` font-size: 15px; color: #475569; line-height: 24px; margin-bottom: 30px; `;
const Divider = styled.View` height: 1px; background: #f1f5f9; margin-bottom: 25px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 15px; `;
const UserCard = styled.View` flex-direction: row; align-items: center; background: #f8fafc; padding: 15px; border-radius: 20px; border: 1px solid #f1f5f9; `;
const Avatar = styled.View` width: 44px; height: 44px; border-radius: 22px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const UserInfo = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-weight: 800; color: #1e293b; `;
const Sub = styled.Text` font-size: 11px; color: #64748b; margin-top: 2px; `;
const ChatBtn = styled.TouchableOpacity` background: #15803d; padding: 12px; border-radius: 12px; elevation: 3; `;
const AdminPanel = styled.View` margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 24px; border: 1px solid #e2e8f0; `;
const PanelTitle = styled.Text` font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 15px; text-align: center; `;
const MainActionBtn = styled.TouchableOpacity` background: ${props => props.bg}; padding: 18px; border-radius: 16px; flex-direction: row; justify-content: center; align-items: center; gap: 10px; elevation: 4; `;
const BtnText = styled.Text` color: #fff; font-weight: 900; font-size: 16px; `;
const ActionHint = styled.Text` font-size: 11px; color: #94a3b8; text-align: center; margin-top: 12px; font-weight: 700; `;
const ReviewInfo = styled.View` background: #fffbeb; padding: 20px; border-radius: 18px; border: 1px solid #fef3c7; flex-direction: row; align-items: center; gap: 15px; margin-top: 20px; `;
const ReviewText = styled.Text` flex: 1; color: #b45309; font-size: 13px; font-weight: 700; line-height: 18px; `;
const SuccessCard = styled.View` background: #f0fdf4; padding: 20px; border-radius: 18px; border: 1px solid #dcfce7; flex-direction: row; align-items: center; gap: 15px; margin-top: 20px; `;
const SuccessText = styled.Text` flex: 1; color: #16a34a; font-size: 13px; font-weight: 700; `;

export default ReportDetailScreen;