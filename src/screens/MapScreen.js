import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, Truck, MapPin } from 'lucide-react-native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const MapScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user.role === 'admin';

  const fetchMapData = async () => {
    try {
      // Admin sees ALL assigned/in-progress; Collector sees only their own
      const endpoint = isAdmin ? '/requests' : '/requests?status=assigned';
      const res = await apiClient.get(endpoint);
      setData(res.data.data.filter(item => item.location?.coordinates[0] !== 0));
    } catch (e) {
      console.log("Map Fetch Error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMapData(); }, []));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -1.9441, longitude: 30.0619,
          latitudeDelta: 0.1, longitudeDelta: 0.1,
        }}
      >
        {data.map((item) => (
          <Marker
            key={item._id}
            coordinate={{
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
            }}
          >
            <MarkerContainer priority={item.priority}>
              <MarkerText>{item.wasteType[0].toUpperCase()}</MarkerText>
            </MarkerContainer>
            <Callout onPress={() => navigation.navigate('RequestDetail', { item })}>
              <StyledCallout>
                <CalloutTitle>{item.wasteType.toUpperCase()}</CalloutTitle>
                <CalloutSub>{item.location.address}</CalloutSub>
                <ViewLink>Manage Task →</ViewLink>
              </StyledCallout>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* FLOATING BACK BUTTON FOR ADMIN */}
      <BackButton onPress={() => navigation.goBack()}>
        <ChevronLeft color="#0f172a" size={28} />
      </BackButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});

const BackButton = styled.TouchableOpacity` position: absolute; top: 50px; left: 20px; background: #fff; width: 50px; height: 50px; border-radius: 25px; justify-content: center; align-items: center; elevation: 5; shadow-opacity: 0.2; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const MarkerContainer = styled.View` width: 34px; height: 34px; border-radius: 17px; background: ${props => props.priority === 'high' ? '#dc2626' : '#15803d'}; border: 2px solid #fff; justify-content: center; align-items: center; `;
const MarkerText = styled.Text` color: #fff; font-weight: bold; `;
const StyledCallout = styled.View` padding: 10px; min-width: 160px; `;
const CalloutTitle = styled.Text` font-weight: 800; color: #0f172a; `;
const CalloutSub = styled.Text` font-size: 12px; color: #64748b; `;
const ViewLink = styled.Text` font-size: 11px; color: #15803d; font-weight: 800; margin-top: 5px; `;

export default MapScreen;