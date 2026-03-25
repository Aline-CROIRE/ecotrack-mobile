import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import apiClient from '../api/client';

const MapScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    try {
      const res = await apiClient.get('/requests?status=assigned');
      // SAFETY: Only keep requests that have valid coordinates
      const validPins = res.data.data.filter(item => 
        item.location && 
        item.location.coordinates && 
        item.location.coordinates.length === 2 &&
        item.location.coordinates[0] !== 0
      );
      setRequests(validPins);
    } catch (e) {
      console.log("Map Load Error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPins(); }, []));

  if (loading) return <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -1.9441, 
          longitude: 30.0619,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {requests.map((item) => (
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
                <ViewLink>View Details →</ViewLink>
              </StyledCallout>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const MarkerContainer = styled.View` width: 35px; height: 35px; border-radius: 18px; background: ${props => props.priority === 'high' ? '#dc2626' : '#15803d'}; border: 2px solid #fff; justify-content: center; align-items: center; `;
const MarkerText = styled.Text` color: #fff; font-weight: bold; `;
const StyledCallout = styled.View` padding: 10px; min-width: 160px; `;
const CalloutTitle = styled.Text` font-weight: 800; color: #0f172a; `;
const CalloutSub = styled.Text` font-size: 12px; color: #64748b; margin-top: 2px; `;
const ViewLink = styled.Text` font-size: 12px; color: #15803d; font-weight: bold; margin-top: 8px; `;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});

export default MapScreen;