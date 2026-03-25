import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Camera, Calendar, MapPin, X, Navigation, Edit3 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';

const NewRequestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [form, setForm] = useState({
    wasteType: 'plastic',
    priority: 'medium',
    address: '',
    latitude: null,
    longitude: null,
    scheduledDate: new Date(),
  });

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      // 1. Request Permission explicitly
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocLoading(false);
        return Alert.alert('Permission Denied', 'Please allow location access in your phone settings.');
      }

      // 2. Try to get Last Known Position (This is instant and works indoors)
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        setForm(prev => ({
          ...prev,
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          address: `GPS: ${lastKnown.coords.latitude.toFixed(4)}, ${lastKnown.coords.longitude.toFixed(4)}`
        }));
      }

      // 3. Try to get fresh location with 'Balanced' accuracy (faster than satellite)
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Uses WiFi/Cell instead of just satellite
        timeout: 10000, // Wait max 10 seconds
      });

      setForm(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `GPS Pin: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
      }));

    } catch (error) {
      console.log("Location Error:", error.message);
      // If fresh location fails but we have lastKnown, we don't alert.
      if (!form.latitude) {
        Alert.alert('Location Error', 'Unable to get GPS. Try moving near a window or check if Location/Wi-Fi is ON.');
      }
    } finally {
      setLocLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!form.latitude) return Alert.alert('Error', 'Please capture your location first.');
    if (!form.address) return Alert.alert('Error', 'Please add a small address description.');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('wasteType', form.wasteType);
    formData.append('priority', form.priority);
    formData.append('address', form.address);
    formData.append('latitude', form.latitude.toString());
    formData.append('longitude', form.longitude.toString());
    formData.append('scheduledDate', form.scheduledDate.toISOString());
    
    if (image) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type });
    }

    try {
      await apiClient.post('/requests', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      Alert.alert('Success', 'Pickup Point Pinned!', [{ text: 'OK', onPress: () => navigation.navigate('Main') }]);
    } catch (e) {
      Alert.alert('Error', 'Failed to send request. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <TouchableOpacityStyled onPress={() => navigation.goBack()}><X color="#0f172a" size={24} /></TouchableOpacityStyled>
        <HeaderText>New Pickup Request</HeaderText>
        <View style={{ width: 24 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        <SectionLabel>1. Waste Category</SectionLabel>
        <ChipsContainer>
          {['plastic', 'organic', 'metal', 'electronic', 'other'].map((t) => (
            <Chip key={t} active={form.wasteType === t} onPress={() => setForm({...form, wasteType: t})}>
              <ChipText active={form.wasteType === t}>{t}</ChipText>
            </Chip>
          ))}
        </ChipsContainer>

        <SectionLabel>2. Location (GPS Required)</SectionLabel>
        <GPSButton onPress={getCurrentLocation} activeOpacity={0.8} hasCoords={!!form.latitude}>
          {locLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Navigation color="#fff" size={20} />
              <GPSButtonText>
                {form.latitude ? "GPS Point Captured ✓" : "Capture My Location"}
              </GPSButtonText>
            </>
          )}
        </GPSButton>

        <InputWrapper>
          <Edit3 color="#64748b" size={18} />
          <StyledInput 
            placeholder="Add landmark (e.g. Near gate)" 
            value={form.address}
            onChangeText={(text) => setForm({...form, address: text})}
          />
        </InputWrapper>

        <SectionLabel>3. Date & Evidence</SectionLabel>
        <InputGroup onPress={() => setShowDatePicker(true)}>
          <Calendar color="#15803d" size={20} />
          <DateDisplay>{form.scheduledDate.toDateString()}</DateDisplay>
        </InputGroup>

        {showDatePicker && (
          <DateTimePicker value={form.scheduledDate} mode="date" display="default"
            onChange={(e, d) => { setShowDatePicker(false); if(d) setForm({...form, scheduledDate: d}); }}
          />
        )}

        <PhotoUpload onPress={pickImage}>
          {image ? <PreviewImage source={{ uri: image }} /> : <View style={{alignItems:'center'}}><Camera color="#15803d" size={32} /><UploadText>Add Photo</UploadText></View>}
        </PhotoUpload>

        <SubmitButton onPress={handleSubmit} disabled={loading || locLoading}>
          {loading ? <ActivityIndicator color="#fff" /> : <SubmitText>Confirm Request</SubmitText>}
        </SubmitButton>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const TouchableOpacityStyled = styled.TouchableOpacity``;
const HeaderText = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const SectionLabel = styled.Text` font-size: 14px; font-weight: 800; color: #64748b; margin-top: 25px; margin-bottom: 12px; `;
const ChipsContainer = styled.View` flex-direction: row; flex-wrap: wrap; gap: 10px; `;
const Chip = styled.TouchableOpacity` padding: 12px 16px; border-radius: 12px; background: ${props => props.active ? '#15803d' : '#f8fafc'}; border: 1px solid ${props => props.active ? '#15803d' : '#e2e8f0'}; `;
const ChipText = styled.Text` text-transform: capitalize; color: ${props => props.active ? '#fff' : '#64748b'}; font-weight: 700; `;
const GPSButton = styled.TouchableOpacity` background: ${props => props.hasCoords ? '#16a34a' : '#0f172a'}; padding: 18px; border-radius: 15px; flex-direction: row; justify-content: center; align-items: center; gap: 10px; margin-bottom: 15px; `;
const GPSButtonText = styled.Text` color: #fff; font-weight: 800; `;
const InputWrapper = styled.View` flex-direction: row; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 15px; border-radius: 12px; `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 15px; color: #0f172a; `;
const InputGroup = styled.TouchableOpacity` flex-direction: row; align-items: center; background: #f8fafc; padding: 16px; border-radius: 15px; border: 1px solid #e2e8f0; margin-top: 10px; `;
const DateDisplay = styled.Text` margin-left: 10px; font-size: 16px; color: #0f172a; `;
const PhotoUpload = styled.TouchableOpacity` height: 160px; background: #f0fdf4; border-radius: 20px; border: 2px dashed #15803d; overflow: hidden; margin-top: 20px; justify-content: center; align-items: center; `;
const PreviewImage = styled.Image` width: 100%; height: 100%; `;
const UploadText = styled.Text` color: #15803d; font-weight: 700; margin-top: 8px; `;
const SubmitButton = styled.TouchableOpacity` background: #15803d; padding: 20px; border-radius: 18px; align-items: center; margin-top: 30px; margin-bottom: 40px; `;
const SubmitText = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;

export default NewRequestScreen;