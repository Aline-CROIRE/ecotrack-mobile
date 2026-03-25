import React, { useState } from 'react';
// Added 'View' to the import list below:
import { ScrollView, Alert, ActivityIndicator, Image, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import styled from 'styled-components/native';
import { Camera, Calendar, MapPin, ChevronRight, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/client';

const NewRequestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [form, setForm] = useState({
    wasteType: 'plastic',
    priority: 'medium',
    address: '',
    scheduledDate: new Date(),
  });

  const wasteTypes = ['organic', 'plastic', 'paper', 'metal', 'electronic'];
  const priorities = ['low', 'medium', 'high'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'We need access to your gallery to upload photos.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!form.address) return Alert.alert('Missing Info', 'Please provide a pickup location');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('wasteType', form.wasteType);
    formData.append('priority', form.priority);
    formData.append('address', form.address);
    formData.append('scheduledDate', form.scheduledDate.toISOString());
    
    if (image) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type });
    }

    try {
      await apiClient.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Request Sent!', 'A collector will be notified immediately.', [
        { text: 'Great', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Submission Failed', error.response?.data?.message || 'Check your internet connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <TouchableOpacityStyled onPress={() => navigation.goBack()}>
          <X color="#0f172a" size={24} />
        </TouchableOpacityStyled>
        <HeaderText>New Pickup Request</HeaderText>
        {/* This is the View that was causing the error: */}
        <View style={{ width: 24 }} /> 
      </Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <SectionLabel>Waste Category</SectionLabel>
        <ChipsContainer>
          {wasteTypes.map((type) => (
            <Chip 
              key={type} 
              active={form.wasteType === type}
              onPress={() => setForm({ ...form, wasteType: type })}
            >
              <ChipText active={form.wasteType === type}>{type}</ChipText>
            </Chip>
          ))}
        </ChipsContainer>

        <SectionLabel>Priority Level</SectionLabel>
        <ChipsContainer>
          {priorities.map((p) => (
            <PriorityChip 
              key={p} 
              active={form.priority === p} 
              priority={p}
              onPress={() => setForm({ ...form, priority: p })}
            >
              <ChipText active={form.priority === p}>{p}</ChipText>
            </PriorityChip>
          ))}
        </ChipsContainer>

        <SectionLabel>Pickup Details</SectionLabel>
        <InputGroup>
          <MapPin color="#15803d" size={20} />
          <StyledInput 
            placeholder="Street address, City" 
            placeholderTextColor="#94a3b8"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
        </InputGroup>

        <InputGroup onPress={() => setShowDatePicker(true)}>
          <Calendar color="#15803d" size={20} />
          <DateDisplay>{form.scheduledDate.toDateString()}</DateDisplay>
          <ChevronRight color="#cbd5e1" size={20} />
        </InputGroup>

        {showDatePicker && (
          <DateTimePicker
            value={form.scheduledDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setForm({ ...form, scheduledDate: date });
            }}
          />
        )}

        <SectionLabel>Photo Evidence</SectionLabel>
        <PhotoUpload onPress={pickImage}>
          {image ? (
            <PreviewImage source={{ uri: image }} />
          ) : (
            <PhotoPlaceholder>
              <Camera color="#15803d" size={32} />
              <UploadText>Attach Photo</UploadText>
            </PhotoPlaceholder>
          )}
        </PhotoUpload>

        <SubmitButton onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <SubmitText>Submit Request</SubmitText>
          )}
        </SubmitButton>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (PREMIUM DARK EMERALD) ---
const Container = styled(SafeAreaView)` flex: 1; background: #ffffff; `;

const Header = styled.View` 
  flex-direction: row; 
  justify-content: space-between; 
  align-items: center; 
  padding: 10px 20px 20px; 
  border-bottom-width: 1px; 
  border-bottom-color: #f1f5f9; 
`;

const TouchableOpacityStyled = styled.TouchableOpacity``;

const HeaderText = styled.Text` 
  font-size: 18px; 
  font-weight: 800; 
  color: #0f172a; 
`;

const SectionLabel = styled.Text` 
  font-size: 14px; 
  font-weight: 800; 
  color: #64748b; 
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 25px; 
  margin-bottom: 12px; 
`;

const ChipsContainer = styled.View` flex-direction: row; flex-wrap: wrap; gap: 10px; `;

const Chip = styled.TouchableOpacity` 
  padding: 12px 16px; 
  border-radius: 12px; 
  background: ${props => props.active ? '#15803d' : '#f8fafc'}; 
  border: 1px solid ${props => props.active ? '#15803d' : '#e2e8f0'};
`;

const PriorityChip = styled(Chip)` 
  background: ${props => props.active ? (props.priority === 'high' ? '#dc2626' : '#15803d') : '#f8fafc'}; 
  border-color: ${props => props.active ? (props.priority === 'high' ? '#dc2626' : '#15803d') : '#e2e8f0'}; 
`;

const ChipText = styled.Text` 
  text-transform: capitalize; 
  color: ${props => props.active ? '#fff' : '#64748b'}; 
  font-weight: 700; 
`;

const InputGroup = styled.TouchableOpacity` 
  flex-direction: row; 
  align-items: center; 
  background: #f8fafc; 
  padding: 16px; 
  border-radius: 15px; 
  border: 1px solid #e2e8f0; 
  margin-bottom: 12px; 
`;

const StyledInput = styled.TextInput` 
  flex: 1; 
  margin-left: 12px; 
  font-size: 16px; 
  color: #0f172a; 
`;

const DateDisplay = styled.Text` 
  flex: 1; 
  margin-left: 12px; 
  font-size: 16px; 
  color: #0f172a; 
`;

const PhotoUpload = styled.TouchableOpacity` 
  height: 220px; 
  background: #f0fdf4; 
  border-radius: 20px; 
  border: 2px dashed #15803d; 
  overflow: hidden; 
  margin-bottom: 40px; 
`;

const PhotoPlaceholder = styled.View` flex: 1; justify-content: center; align-items: center; `;
const PreviewImage = styled.Image` width: 100%; height: 100%; `;
const UploadText = styled.Text` color: #15803d; font-weight: 700; margin-top: 10px; `;

const SubmitButton = styled.TouchableOpacity` 
  background: #15803d; 
  padding: 20px; 
  border-radius: 18px; 
  align-items: center; 
  elevation: 5;
  shadow-color: #15803d;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
`;

const SubmitText = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;

export default NewRequestScreen;