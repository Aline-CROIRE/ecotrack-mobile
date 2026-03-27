import React, { useState, useCallback, useContext } from 'react';
import { 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
  View, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Clock, MapPin, Package, 
  CheckCircle2, AlertCircle, User, Truck, LayoutGrid, ChevronRight
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const RequestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const isAdmin = user?.role === 'admin';

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/requests');
      const data = response.data.data || [];
      setRequests(data);
      applyFilter(activeFilter, data);
    } catch (error) { console.log(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const applyFilter = (filter, data = requests) => {
    setActiveFilter(filter);
    if (filter === 'all') setFilteredData(data);
    else setFilteredData(data.filter(item => item.status === filter));
  };

  useFocusEffect(useCallback(() => { fetchRequests(); }, [activeFilter]));

  const getStatusCfg = (status) => {
    switch (status) {
      case 'completed': return { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 };
      case 'in-progress': return { color: '#2563eb', bg: '#dbeafe', icon: Clock };
      case 'assigned': return { color: '#15803d', bg: '#f0fdf4', icon: Truck };
      default: return { color: '#ca8a04', bg: '#fef9c3', icon: AlertCircle };
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* 1. PREMIUM HEADER */}
      <Header>
        <TitleSection>
          <Title>{isAdmin ? 'Global Fleet' : 'Mission History'}</Title>
          <Subtitle>{filteredData.length} active collection points</Subtitle>
        </TitleSection>
        <AvatarSmall>{user?.name?.charAt(0)}</AvatarSmall>
      </Header>

      {/* 2. TACTILE CONTROL HUB (The Filter) */}
      <ControlHub>
        <GridRow>
          {[
            {id: 'all', label: 'ALL', icon: LayoutGrid},
            {id: 'pending', label: 'WAITING', icon: AlertCircle},
            {id: 'assigned', label: 'READY', icon: User},
            {id: 'in-progress', label: 'ACTIVE', icon: Truck},
            {id: 'completed', label: 'DONE', icon: CheckCircle2}
          ].map((item) => (
            <GridItem key={item.id} active={activeFilter === item.id} onPress={() => applyFilter(item.id)}>
              {activeFilter === item.id ? (
                <ActiveGradient colors={['#064e3b', '#15803d']} start={{x:0, y:0}} end={{x:1, y:1}}>
                   <item.icon size={18} color="#fff" />
                </ActiveGradient>
              ) : (
                <IconCircle><item.icon size={18} color="#94a3b8" /></IconCircle>
              )}
              <GridLabel active={activeFilter === item.id}>{item.label}</GridLabel>
            </GridItem>
          ))}
        </GridRow>
      </ControlHub>

      {/* 3. OPERATIONS LIST */}
      {loading && !refreshing ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const cfg = getStatusCfg(item.status);
            return (
              <Card activeOpacity={0.9} onPress={() => navigation.navigate('RequestDetail', { item })}>
                <CardHeader>
                  <WasteBadge><WasteText>{(item?.wasteType || 'General').toUpperCase()}</WasteText></WasteBadge>
                  <StatusBadge color={cfg.color} bg={cfg.bg}>
                    <cfg.icon size={12} color={cfg.color} />
                    <StatusText color={cfg.color}>{item.status.toUpperCase()}</StatusText>
                  </StatusBadge>
                </CardHeader>
                
                <CardBody>
                  <LocationRow>
                    <MapPin size={16} color="#15803d" />
                    <AddressText numberOfLines={1}>{item?.location?.address}</AddressText>
                  </LocationRow>
                </CardBody>

                <CardFooter>
                    <RequesterInfo>
                        <User size={12} color="#94a3b8" />
                        <FooterName numberOfLines={1}>{isAdmin ? item.citizen?.name : (item.collector?.name || 'Unassigned')}</FooterName>
                    </RequesterInfo>
                    <DateText>{new Date(item.createdAt).toLocaleDateString()}</DateText>
                </CardFooter>
                
                {/* Visual Progress Bar on Card */}
                <CardProgressBar color={cfg.color} />
              </Card>
            );
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchRequests();}} tintColor="#15803d" />}
          ListEmptyComponent={<EmptyState><Package size={60} color="#cbd5e1" /><EmptyText>Zero missions found</EmptyText></EmptyState>}
        />
      )}
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;

const Header = styled.View` 
  flex-direction: row; justify-content: space-between; align-items: center; 
  padding: 20px 25px; background: #fff; 
`;

const Title = styled.Text` font-size: 26px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; `;
const TitleSection = styled.View``;
const AvatarSmall = styled.Text` width: 35px; height: 35px; border-radius: 10px; background: #f0fdf4; text-align: center; line-height: 35px; color: #15803d; font-weight: 900; border: 1px solid #dcfce7; `;

const ControlHub = styled.View` 
  background: #fff; padding: 5px 15px 25px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; 
  elevation: 10; shadow-opacity: 0.05; shadow-radius: 10px; shadow-color: #000;
`;
const GridRow = styled.View` flex-direction: row; justify-content: space-around; `;
const GridItem = styled.TouchableOpacity` align-items: center; flex: 1; `;

const IconCircle = styled.View` 
  width: 46px; height: 46px; border-radius: 16px; background: #f8fafc; 
  justify-content: center; align-items: center; margin-bottom: 8px; border: 1px solid #f1f5f9; 
`;

const ActiveGradient = styled(LinearGradient)` 
  width: 46px; height: 46px; border-radius: 16px; 
  justify-content: center; align-items: center; margin-bottom: 8px; elevation: 4;
`;

const GridLabel = styled.Text` 
  font-size: 8px; font-weight: 900; color: ${props => props.active ? '#15803d' : '#94a3b8'}; letter-spacing: 0.5px;
`;

const Card = styled.TouchableOpacity` 
  background: #fff; border-radius: 24px; margin-bottom: 16px; padding: 20px; 
  border: 1px solid #f1f5f9; elevation: 5; shadow-opacity: 0.08; shadow-radius: 12px; overflow: hidden;
`;
const CardHeader = styled.View` flex-direction: row; justify-content: space-between; margin-bottom: 15px; `;
const WasteBadge = styled.View` background: #f8fafc; padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; `;
const WasteText = styled.Text` color: #0f172a; font-weight: 800; font-size: 10px; `;
const StatusBadge = styled.View` flex-direction: row; align-items: center; background: ${props => props.bg}; padding: 5px 12px; border-radius: 8px; gap: 6px; `;
const StatusText = styled.Text` color: ${props => props.color}; font-weight: 900; font-size: 10px; `;

const CardBody = styled.View` margin-bottom: 15px; `;
const LocationRow = styled.View` flex-direction: row; align-items: center; `;
const AddressText = styled.Text` margin-left: 8px; font-size: 15px; color: #1e293b; font-weight: 800; flex: 1; `;

const CardFooter = styled.View` flex-direction: row; justify-content: space-between; align-items: center; pt: 10px; `;
const RequesterInfo = styled.View` flex-direction: row; align-items: center; gap: 6px; flex: 1; `;
const FooterName = styled.Text` font-size: 12px; color: #64748b; font-weight: 700; `;
const DateText = styled.Text` font-size: 11px; color: #cbd5e1; font-weight: 800; `;

const CardProgressBar = styled.View` position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: ${props => props.color}; opacity: 0.8; `;

const EmptyState = styled.View` align-items: center; margin-top: 80px; `;
const EmptyText = styled.Text` margin-top: 15px; color: #94a3b8; font-size: 16px; font-weight: 800; `;

export default RequestsScreen;