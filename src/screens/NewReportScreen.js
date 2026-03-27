import React, { useState } from 'react';
import { 
  ScrollView, Alert, ActivityIndicator, Image, 
  View, TouchableOpacity, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, AlertTriangle, FileText, Camera, 
  CheckCircle2, Info, MessageSquarePlus
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';

const NewReportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      return Alert.alert('Missing Info', 'Please provide a title and description of the issue.');
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
        'Alert Dispatched', 
        'City administrators have been notified of this incident.', 
        [{ text: 'DONE', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to transmit report. Check your connection.');
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      {/* HEADER */}
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <X color="#0f172a" size={28} />
        </TouchableOpacity>
        <HeaderTitle>File Incident Report</HeaderTitle>
        <View style={{ width: 33 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 25 }}>
        
        {/* INFO BANNER */}
        <Banner>
            <AlertTriangle color="#dc2626" size={20} />
            <BannerText>Use this console to report illegal dumping, damaged bins, or system failures.</BannerText>
        </Banner>

        {/* STEP 1: SUMMARY */}
        <StepHeader>
            <StepNum>01</StepNum>
            <StepLabel>INCIDENT SUMMARY</StepLabel>
        </StepHeader>
        <InputBox>
            <FileText color="#dc2626" size={18} />
            <StyledInput 
                placeholder="What happened? (e.g. Broken Bin)" 
                placeholderTextColor="#94a3b8"
                value={form.title}
                onChangeText={(text) => setForm({...form, title: text})}
            />
        </InputBox>

        {/* STEP 2: DESCRIPTION */}
        <StepHeader>
            <StepNum>02</StepNum>
            <StepLabel>DETAILED DESCRIPTION</StepLabel>
        </StepHeader>
        <TextAreaBox>
            <StyledTextArea 
                placeholder="Describe the location and specific details to help us investigate faster..." 
                placeholderTextColor="#94a3b8"
                multiline 
                numberOfLines={6}
                textAlignVertical="top"
                value={form.description}
                onChangeText={(text) => setForm({...form, description: text})}
            />
        </TextAreaBox>

        {/* STEP 3: EVIDENCE */}
        <StepHeader>
            <StepNum>03</StepNum>
            <StepLabel>VISUAL EVIDENCE (OPTIONAL)</StepLabel>
        </StepHeader>
        <PhotoUpload onPress={pickImage} activeOpacity={0.8}>
            {image ? (
                <PreviewImage source={{ uri: image }} />
            ) : (
                <PhotoPlaceholder>
                    <IconCircle>
                        <Camera color="#dc2626" size={32} />
                    </IconCircle>
                    <UploadText>Attach Evidence Photo</UploadText>
                </PhotoPlaceholder>
            )}
        </PhotoUpload>

        {/* SUBMIT BUTTON */}
        <SubmitArea>
            <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.9}>
                <LinearGradient 
                    colors={['#991b1b', '#dc2626']} 
                    start={{x:0, y:0}} end={{x:1, y:1}}
                    style={{ padding: 20, borderRadius: 20, alignItems: 'center', elevation: 8 }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                            <MessageSquarePlus color="#fff" size={20} />
                            <SubmitText>TRANSMIT ALERT NOW</SubmitText>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
            <SafetyHint>False reporting is subject to system suspension.</SafetyHint>
        </SubmitArea>

      </ScrollView>
    </Container>
  );
};

// --- STYLED COMPONENTS (HIGH-FIDELITY INCIDENT UI) ---

const Container = styled.View` flex: 1; background: #ffffff; `;

const Header = styled.View` 
  flex-direction: row; justify-content: space-between; align-items: center; 
  padding: 10px 20px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; 
`;

const HeaderTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;

const Banner = styled.View` 
  flex-direction: row; align-items: center; background: #fef2f2; 
  padding: 15px; border-radius: 15px; border: 1px solid #fecdd3; gap: 12px;
`;

const BannerText = styled.Text` flex: 1; color: #991b1b; font-size: 12px; font-weight: 700; line-height: 18px; `;

const StepHeader = styled.View` flex-direction: row; align-items: center; margin-top: 35px; margin-bottom: 15px; `;

const StepNum = styled.Text` font-size: 24px; font-weight: 900; color: #f1f5f9; position: absolute; left: -5px; top: -10px; `;

const StepLabel = styled.Text` font-size: 11px; font-weight: 900; color: #94a3b8; letter-spacing: 1.5px; margin-left: 20px; `;

const InputBox = styled.View` 
  flex-direction: row; align-items: center; background: #f8fafc; 
  border-radius: 15px; border: 1px solid #e2e8f0; padding: 14px 15px; 
`;

const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 16px; font-weight: 700; color: #0f172a; `;

const TextAreaBox = styled.View` 
  background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; padding: 15px; 
`;

const StyledTextArea = styled.TextInput` font-size: 15px; font-weight: 600; color: #0f172a; min-height: 120px; `;

const PhotoUpload = styled.TouchableOpacity` 
  height: 200px; background: #f8fafc; border-radius: 24px; border: 2px dashed #cbd5e1; 
  overflow: hidden; margin-top: 5px; 
`;

const PhotoPlaceholder = styled.View` flex: 1; justify-content: center; align-items: center; `;

const IconCircle = styled.View` width: 60px; height: 60px; border-radius: 30px; background: #fff; justify-content: center; align-items: center; elevation: 3; `;

const UploadText = styled.Text` color: #64748b; font-weight: 800; font-size: 12px; margin-top: 15px; `;

const PreviewImage = styled.Image` width: 100%; height: 100%; `;

const SubmitArea = styled.View` margin-top: 40px; margin-bottom: 60px; `;

const SubmitText = styled.Text` color: #fff; font-size: 14px; font-weight: 900; letter-spacing: 1px; `;

const SafetyHint = styled.Text` text-align: center; color: #cbd5e1; font-size: 10px; font-weight: 800; margin-top: 15px; `;

export default NewReportScreen;