import React, { useState, useEffect } from 'react';
import { 
  FlatList, ActivityIndicator, TouchableOpacity, 
  View, Alert, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { 
  ChevronLeft, User, CheckCircle2, 
  Search, Star, Zap, Phone 
} from 'lucide-react-native';
import apiClient from '../api/client';

const AdminUserListScreen = ({ route, navigation }) => {
  const { requestId } = route.params || {};
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPersonnelData();
  }, []);

  const fetchPersonnelData = async () => {
    try {
      // Fetch both users and admin overview to calculate performance in one go
      const [usersRes, statsRes] = await Promise.all([
        apiClient.get('/auth/users'),
        apiClient.get('/analytics/admin-overview')
      ]);

      const allUsers = usersRes.data.data || [];
      const rankings = statsRes.data.rankings || [];

      // Merge data to show efficiency in the selection list
      const filteredCollectors = allUsers
        .filter(u => u.role === 'collector')
        .map(u => {
          const stats = rankings.find(r => r._id === u._id);
          return {
            ...u,
            efficiency: stats ? Math.round((stats.completedCount / (stats.completedCount + stats.pendingCount || 1)) * 100) : 0,
            tasks: stats ? stats.completedCount : 0
          };
        });

      setCollectors(filteredCollectors);
    } catch (e) {
      console.log("Personnel fetch error");
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (collector) => {
    Alert.alert(
      "Confirm Re-assignment",
      `Are you sure you want to assign this mission to ${collector.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "CONFIRM", 
          onPress: async () => {
            try {
              await apiClient.put(`/requests/${requestId}/assign`, { collectorId: collector._id });
              Alert.alert("Success", "Personnel successfully re-assigned.");
              navigation.navigate('Main');
            } catch (e) {
              Alert.alert("Error", "System was unable to update assignment.");
            }
          }
        }
      ]
    );
  };

  const filteredList = collectors.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      {/* 1. CLEAN SYSTEM TOP */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* 2. SEARCH & HEADER */}
      <Header>
        <HeaderTop>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                <ChevronLeft color="#0f172a" size={32} />
            </TouchableOpacity>
            <TitleSection>
                <Title>Select Personnel</Title>
                <Subtitle>MISSION RE-ASSIGNMENT</Subtitle>
            </TitleSection>
            <View style={{ width: 42 }} />
        </HeaderTop>
        
        <SearchBox>
            <Search color="#94a3b8" size={18} />
            <SearchInput 
                placeholder="Search by name..." 
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
            />
        </SearchBox>
      </Header>

      {/* 3. PERSONNEL LIST */}
      {loading ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <UserCard activeOpacity={0.9} onPress={() => handleReassign(item)}>
              <AvatarContainer>
                <AvatarInner>
                    <User color="#fff" size={22} />
                </AvatarInner>
                <StatusRing />
              </AvatarContainer>
              
              <InfoSection>
                <NameRow>
                    <Name>{item.name}</Name>
                    <EfficiencyBadge>
                        <Zap size={10} color="#16a34a" />
                        <EfficiencyText>{item.efficiency}% ROI</EfficiencyText>
                    </EfficiencyBadge>
                </NameRow>
                <ContactText>{item.phone} • {item.tasks} Completed</ContactText>
              </InfoSection>

              <SelectAction>
                  <CheckCircle2 color="#cbd5e1" size={24} />
              </SelectAction>
            </UserCard>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          ListEmptyComponent={
            <EmptyState>
                <User size={50} color="#cbd5e1" />
                <EmptyTitle>No Personnel Found</EmptyTitle>
            </EmptyState>
          }
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #f8fafc; `;

const Header = styled.View` background: #fff; padding: 10px 20px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;

const HeaderTop = styled.View` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px; `;

const TitleSection = styled.View` align-items: center; `;
const Title = styled.Text` font-size: 20px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 9px; font-weight: 800; color: #15803d; letter-spacing: 1.5px; `;

const SearchBox = styled.View` 
  flex-direction: row; align-items: center; background: #f8fafc; 
  padding: 12px 15px; border-radius: 15px; border: 1px solid #e2e8f0; 
`;

const SearchInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 15px; font-weight: 700; color: #0f172a; `;

const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;

const UserCard = styled.TouchableOpacity` 
  flex-direction: row; align-items: center; background: #fff; 
  padding: 16px; border-radius: 22px; margin-bottom: 12px; 
  border: 1px solid #f1f5f9; elevation: 3; shadow-opacity: 0.05; shadow-radius: 10px;
`;

const AvatarContainer = styled.View` position: relative; `;
const AvatarInner = styled.View` width: 50px; height: 50px; border-radius: 15px; background: #0f172a; justify-content: center; align-items: center; `;
const StatusRing = styled.View` position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 7px; background: #16a34a; border: 3px solid #fff; `;

const InfoSection = styled.View` flex: 1; margin-left: 15px; `;
const NameRow = styled.View` flex-direction: row; align-items: center; gap: 8px; `;
const Name = styled.Text` font-size: 16px; font-weight: 800; color: #1e293b; `;

const EfficiencyBadge = styled.View` flex-direction: row; align-items: center; background: #dcfce7; padding: 2px 8px; border-radius: 6px; gap: 3px; `;
const EfficiencyText = styled.Text` font-size: 9px; font-weight: 900; color: #16a34a; `;

const ContactText = styled.Text` font-size: 12px; color: #94a3b8; font-weight: 700; margin-top: 4px; `;

const SelectAction = styled.View` margin-left: 10px; `;

const EmptyState = styled.View` align-items: center; margin-top: 100px; `;
const EmptyTitle = styled.Text` font-size: 16px; font-weight: 800; color: #cbd5e1; margin-top: 15px; `;

export default AdminUserListScreen;