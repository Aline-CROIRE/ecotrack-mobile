import React, { useState, useContext } from 'react';
import { 
  View, TextInput, Alert, ActivityIndicator, 
  TouchableOpacity, ScrollView, StatusBar, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, User, Mail, Phone, Camera, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, reloadUser } = useContext(AuthContext); // Added reloadUser
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);

    if (image) {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type });
    }

    try {
      await apiClient.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // CRITICAL: Refresh the global user state
      await reloadUser();
      
      Alert.alert("Success", "Your profile has been updated!", [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert("Error", "Update failed.");
    } finally { setLoading(false); }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#0f172a" size={30} /></TouchableOpacity>
        <Title>Edit Profile</Title>
        <TouchableOpacity onPress={handleUpdate} disabled={loading}>{loading ? <ActivityIndicator size="small" color="#15803d" /> : <Save color="#15803d" size={26} />}</TouchableOpacity>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <AvatarCenter>
            <TouchableOpacity onPress={pickImage}>
                <AvatarOuter>
                    <AvatarImage source={image ? { uri: image } : (user?.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/logo.png'))} />
                    <EditBadge><Camera color="#fff" size={16} /></EditBadge>
                </AvatarOuter>
            </TouchableOpacity>
        </AvatarCenter>

        <InputLabel>Full Name</InputLabel>
        <InputWrapper><User color="#94a3b8" size={20} /><StyledInput value={form.name} onChangeText={(t) => setForm({...form, name: t})} /></InputWrapper>

        <InputLabel>Email Address</InputLabel>
        <InputWrapper><Mail color="#94a3b8" size={20} /><StyledInput value={form.email} keyboardType="email-address" onChangeText={(t) => setForm({...form, email: t})} /></InputWrapper>

        <InputLabel>Phone Number</InputLabel>
        <InputWrapper><Phone color="#94a3b8" size={20} /><StyledInput value={form.phone} keyboardType="phone-pad" onChangeText={(t) => setForm({...form, phone: t})} /></InputWrapper>
        
        <SubmitBtn onPress={handleUpdate} disabled={loading}><BtnText>{loading ? "SAVING..." : "SAVE PROFILE"}</BtnText></SubmitBtn>
      </ScrollView>
    </Container>
  );
};

const Container = styled.View` flex: 1; background: #ffffff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; `;
const AvatarCenter = styled.View` align-items: center; margin-bottom: 30px; `;
const AvatarOuter = styled.View` width: 100px; height: 100px; border-radius: 50px; padding: 3px; border: 2px solid #15803d; position: relative; `;
const AvatarImage = styled.Image` width: 100%; height: 100%; border-radius: 50px; background: #f8fafc; `;
const EditBadge = styled.View` position: absolute; bottom: 0; right: 0; background: #0f172a; width: 30px; height: 30px; border-radius: 15px; justify-content: center; align-items: center; border: 2px solid #fff; `;
const InputLabel = styled.Text` font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; `;
const InputWrapper = styled.View` flex-direction: row; align-items: center; background: #f8fafc; padding: 12px 15px; border-radius: 12px; border: 1px solid #e2e8f0; `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 16px; font-weight: 700; color: #0f172a; `;
const SubmitBtn = styled.TouchableOpacity` background: #15803d; padding: 18px; border-radius: 15px; align-items: center; margin-top: 30px; margin-bottom: 40px; `;
const BtnText = styled.Text` color: #fff; font-size: 14px; font-weight: 900; `;

export default EditProfileScreen;