import React, { useState, useCallback, useContext, useRef } from 'react';
import { 
  StyleSheet, View, Dimensions, ActivityIndicator, 
  TouchableOpacity, StatusBar, Platform 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { 
  ChevronLeft, Truck, MapPin, Navigation, 
  Target, Info, ArrowRight 
} from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const mapRef = useRef(null);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [trucks, setTrucks] = useState([]);

  const isAdmin = user.role === 'admin';
  const isCollector = user.role === 'collector';

  const refreshMapData = async () => {
    try {
      if (isCollector || isAdmin) {
        const endpoint = isAdmin ? '/requests' : '/requests?status=assigned';
        const res = await apiClient.get(endpoint);
        setData((res.data.data || []).filter(item => item.location?.coordinates[0] !== 0));
      }
      
      if (!isCollector) {
        const res = await apiClient.get('/auth/users');
        const activeTrucks = res.data.data.filter(u => 
            u.role === 'collector' && u.currentLocation?.coordinates[0] !== 0
        );
        setTrucks(activeTrucks);
      }
    } catch (e) {
      console.log("Map Sync Error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { 
    refreshMapData(); 
    const interval = setInterval(refreshMapData, 10000); 
    return () => clearInterval(interval);
  }, []));

  const recenter = () => {
    mapRef.current?.animateToRegion({
      latitude: -1.9441, longitude: 30.0619,
      latitudeDelta: 0.05, longitudeDelta: 0.05,
    }, 1000);
  };

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <Container>
      {/* 1. CLEAN SYSTEM TOP SEPARATION */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <MapContainer>
        <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
            latitude: -1.9441, longitude: 30.0619,
            latitudeDelta: 0.08, longitudeDelta: 0.08,
            }}
            onPress={() => setSelectedMission(null)}
        >
            {/* RENDER MISSION PINS */}
            {(isCollector || isAdmin) && data.map((item) => (
            <Marker
                key={item._id}
                coordinate={{ latitude: item.location.coordinates[1], longitude: item.location.coordinates[0] }}
                onPress={() => setSelectedMission(item)}
            >
                <MarkerPin priority={item.priority} active={selectedMission?._id === item._id}>
                <PinText>{item.wasteType[0].toUpperCase()}</PinText>
                </MarkerPin>
            </Marker>
            ))}

            {/* RENDER LIVE TRUCKS */}
            {!isCollector && trucks.map((truck) => (
            <Marker
                key={truck._id}
                coordinate={{ latitude: truck.currentLocation.coordinates[1], longitude: truck.currentLocation.coordinates[0] }}
            >
                <TruckIconContainer><Truck color="#fff" size={18} /></TruckIconContainer>
            </Marker>
            ))}
        </MapView>

        {/* 2. FLOATING CONTROL OVERLAYS (Below System Top) */}
        <FloatingControls>
            <CircleButton onPress={() => navigation.goBack()}>
                <ChevronLeft color="#0f172a" size={28} />
            </CircleButton>
            
            <MapLabel><MapLabelText>DISPATCH HUB</MapLabelText></MapLabel>

            <CircleButton onPress={recenter}>
                <Target color="#15803d" size={24} />
            </CircleButton>
        </FloatingControls>

        {/* 3. INTERACTIVE MISSION PREVIEW */}
        {selectedMission && (
            <MissionPreviewCard>
                <PreviewTop>
                    <View style={{ flex: 1 }}>
                        <PreviewWasteType>{selectedMission.wasteType.toUpperCase()}</PreviewWasteType>
                        <PreviewAddress numberOfLines={1}>{selectedMission.location.address}</PreviewAddress>
                    </View>
                    <StatusPill status={selectedMission.status}>
                        <StatusText>{selectedMission.status.toUpperCase()}</StatusText>
                    </StatusPill>
                </PreviewTop>
                
                <PreviewDivider />
                
                <PreviewAction onPress={() => navigation.navigate('RequestDetail', { item: selectedMission })}>
                    <ActionGroup>
                        <Info color="#15803d" size={18} />
                        <ActionText>MISSION LOGISTICS</ActionText>
                    </ActionGroup>
                    <ArrowRight color="#15803d" size={20} />
                </PreviewAction>
            </MissionPreviewCard>
        )}
      </MapContainer>
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---

const Container = styled.View` flex: 1; background: #fff; `;
const MapContainer = styled.View` flex: 1; position: relative; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; background: #fff; `;

const FloatingControls = styled.View` 
  position: absolute; top: 20px; left: 0; right: 0; 
  flex-direction: row; align-items: center; justify-content: space-between; 
  padding: 0 20px; 
`;

const CircleButton = styled.TouchableOpacity` 
  background: #ffffff; width: 48px; height: 48px; border-radius: 24px; 
  justify-content: center; align-items: center; elevation: 8; shadow-opacity: 0.15; shadow-radius: 10px;
`;

const MapLabel = styled.View` 
  background: #ffffff; padding: 10px 20px; border-radius: 20px; 
  elevation: 8; shadow-opacity: 0.1; border: 1px solid #f1f5f9;
`;

const MapLabelText = styled.Text` font-size: 10px; font-weight: 900; color: #0f172a; letter-spacing: 1px; `;

const MarkerPin = styled.View` 
  width: 36px; height: 36px; border-radius: 18px; 
  background: ${props => props.priority === 'high' ? '#dc2626' : '#15803d'}; 
  border: 3px solid #fff; justify-content: center; align-items: center; 
  elevation: 10; transform: scale(${props => props.active ? 1.3 : 1});
`;

const PinText = styled.Text` color: #fff; font-weight: 900; font-size: 12px; `;

const TruckIconContainer = styled.View` 
  width: 40px; height: 40px; border-radius: 20px; background: #0f172a; 
  border: 3px solid #15803d; justify-content: center; align-items: center; elevation: 10;
`;

const MissionPreviewCard = styled.View` 
  position: absolute; bottom: 40px; left: 20px; right: 20px; 
  background: #fff; border-radius: 28px; padding: 22px; 
  elevation: 20; shadow-opacity: 0.2; shadow-radius: 15px; border: 1px solid #f1f5f9;
`;

const PreviewTop = styled.View` flex-direction: row; justify-content: space-between; align-items: flex-start; `;
const PreviewWasteType = styled.Text` font-size: 10px; font-weight: 900; color: #15803d; letter-spacing: 1px; `;
const PreviewAddress = styled.Text` font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px; `;

const StatusPill = styled.View` background: #f0fdf4; padding: 5px 12px; border-radius: 8px; border: 1px solid #dcfce7; `;
const StatusText = styled.Text` font-size: 9px; font-weight: 900; color: #16a34a; `;

const PreviewDivider = styled.View` height: 1px; background: #f1f5f9; margin: 18px 0; `;

const PreviewAction = styled.TouchableOpacity` flex-direction: row; align-items: center; justify-content: space-between; `;
const ActionGroup = styled.View` flex-direction: row; align-items: center; gap: 10px; `;
const ActionText = styled.Text` font-size: 12px; font-weight: 900; color: #15803d; letter-spacing: 1px; `;

const styles = StyleSheet.create({
  map: { width: width, height: height },
});

export default MapScreen;