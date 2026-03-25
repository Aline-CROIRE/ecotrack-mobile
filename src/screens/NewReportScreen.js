import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { X, AlertTriangle, FileText, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';

const NewReportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'We need access to your gallery to upload incident photos.');
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
    if (!form.title || !form.description) {
      return Alert.alert('Error', 'Please provide a title and description');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);

    if (image) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type });
    }

    try {
      await apiClient.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setLoading(false);
      Alert.alert(
        'Success', 
        'Incident report submitted. Our team will review it shortly.', 
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit report. Please check your connection.');
    }
  };

  return (
    <Container>
      <Header>
        <CloseButton onPress={() => navigation.navigate('Main')}><X color="#0f172a" size={24} /></CloseButton>
        <HeaderText>New Incident Report</HeaderText>
        <View style={{ width: 24 }} />
      </Header>

      <ScrollView contentContainerStyle={{ padding: 25 }} showsVerticalScrollIndicator={false}>
        <IconCircle><AlertTriangle color="#dc2626" size={40} /></IconCircle>
        <Instructions>Report illegal dumping, damaged bins, or missed collections here.</Instructions>

        <InputLabel>Title</InputLabel>
        <InputWrapper>
          <FileText color="#94a3b8" size={18} />
          <StyledInput 
            placeholder="What is the issue?" 
            value={form.title}
            onChangeText={(text) => setForm({...form, title: text})}
          />
        </InputWrapper>

        <InputLabel>Description</InputLabel>
        <TextArea 
          placeholder="Give us more details..." 
          multiline 
          textAlignVertical="top"
          value={form.description}
          onChangeText={(text) => setForm({...form, description: text})}
        />

        <InputLabel>Evidence (Optional)</InputLabel>
        <PhotoUpload onPress={pickImage}>
          {image ? (
            <PreviewImage source={{ uri: image }} />
          ) : (
            <PhotoPlaceholder>
              <Camera color="#64748b" size={32} />
              <UploadText>Add a Photo</UploadText>
            </PhotoPlaceholder>
          )}
        </PhotoUpload>

        <SubmitButton onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <SubmitText>Submit Report</SubmitText>}
        </SubmitButton>
      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const CloseButton = styled.TouchableOpacity` padding: 5px; `;
const HeaderText = styled.Text` font-size: 18px; font-weight: 800; color: #0f172a; `;
const IconCircle = styled.View` width: 80px; height: 80px; border-radius: 40px; background: #fef2f2; align-self: center; justify-content: center; align-items: center; margin-bottom: 15px; `;
const Instructions = styled.Text` text-align: center; color: #64748b; margin-bottom: 25px; line-height: 18px; `;
const InputLabel = styled.Text` font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px; text-transform: uppercase; `;
const InputWrapper = styled.View` flex-direction: row; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 15px; border-radius: 12px; margin-bottom: 20px; `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 16px; color: #0f172a; `;
const TextArea = styled.TextInput` background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; font-size: 16px; color: #0f172a; min-height: 120px; margin-bottom: 20px; `;
const PhotoUpload = styled.TouchableOpacity` height: 180px; background: #f8fafc; border-radius: 20px; border: 2px dashed #cbd5e1; overflow: hidden; margin-bottom: 35px; `;
const PhotoPlaceholder = styled.View` flex: 1; justify-content: center; align-items: center; `;
const PreviewImage = styled.Image` width: 100%; height: 100%; `;
const UploadText = styled.Text` color: #64748b; font-weight: 700; margin-top: 10px; `;
const SubmitButton = styled.TouchableOpacity` background: #15803d; padding: 20px; border-radius: 15px; align-items: center; margin-bottom: 30px; elevation: 4; `;
const SubmitText = styled.Text` color: #fff; font-size: 18px; font-weight: 800; `;

export default NewReportScreen;