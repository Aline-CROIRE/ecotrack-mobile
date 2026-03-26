import React, { useState } from 'react';
import { 
  ScrollView, Alert, ActivityIndicator, Image, 
  View, TouchableOpacity, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Camera, Calendar, MapPin, X, Navigation, 
  Edit3, Leaf, Milk, FileText, Cpu, HelpCircle, CheckCircle2
} from 'lucide-react-native';
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

  const categories = [
    { id: 'plastic', label: 'Plastic', icon: Milk },
    { id: 'organic', label: 'Organic', icon: Leaf },
    { id: 'paper', label: 'Paper', icon: FileText },
    { id: 'electronic', label: 'E-Waste', icon: Cpu },
    { id: 'other', label: 'Other', icon: HelpCircle },
  ];

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocLoading(false);
        return Alert.alert('Access Denied', 'GPS is required to drop a mission pin.');
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setForm(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `Pinned: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
      }));
    } catch (error) {
      Alert.alert('GPS Error', 'Satellites unreachable. Check if Location is ON.');
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
    if (!form.latitude) return Alert.alert('GPS Required', 'Please capture your exact location.');
    if (!form.address) return Alert.alert('Missing Detail', 'Please provide a landmark or address.');
    
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
      Alert.alert('Mission Active', 'Pickup request successfully deployed.', [{ text: 'OK', onPress: () => navigation.navigate('Main') }]);
    } catch (e) {
      Alert.alert('Server Error', 'Failed to initiate mission. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><X color="#0f172a" size={28} /></TouchableOpacity>
        <HeaderTitle>Initiate Mission</HeaderTitle>
        <View style={{ width: 28 }} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 25 }}>
        
        {/* STEP 1: CATEGORY */}
        <StepHeader><StepNum>01</StepNum><StepLabel>SELECT WASTE CATEGORY</StepLabel></StepHeader>
        <CategoryGrid>
            {categories.map((cat) => (
                <CategoryCard 
                    key={cat.id} 
                    active={form.wasteType === cat.id}
                    onPress={() => setForm({...form, wasteType: cat.id})}
                >
                    <cat.icon size={24} color={form.wasteType === cat.id ? '#15803d' : '#94a3b8'} />
                    <CatLabel active={form.wasteType === cat.id}>{cat.label}</CatLabel>
                </CategoryCard>
            ))}
        </CategoryGrid>

        {/* STEP 2: LOCATION */}
        <StepHeader><StepNum>02</StepNum><StepLabel>DEPLOY GPS PIN</StepLabel></StepHeader>
        <GPSAction onPress={getCurrentLocation} activeOpacity={0.8} hasCoords={!!form.latitude}>
            {locLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                    <Navigation color="#fff" size={20} />
                    <GPSText>{form.latitude ? "LOCATION CAPTURED" : "CAPTURE MY POSITION"}</GPSText>
                    {form.latitude && <CheckCircle2 color="#fff" size={18} />}
                </>
            )}
        </GPSAction>

        <InputBox>
            <Edit3 color="#cbd5e1" size={18} />
            <StyledInput 
                placeholder="Landmark (e.g. Near main gate)" 
                placeholderTextColor="#94a3b8"
                value={form.address}
                onChangeText={(text) => setForm({...form, address: text})}
            />
        </InputBox>

        {/* STEP 3: LOGISTICS */}
        <StepHeader><StepNum>03</StepNum><StepLabel>DATE & EVIDENCE</StepLabel></StepHeader>
        <LogisticsRow>
            <MiniAction onPress={() => setShowDatePicker(true)}>
                <Calendar color="#15803d" size={18} />
                <MiniLabel>{form.scheduledDate.toLocaleDateString()}</MiniLabel>
            </MiniAction>

            <MiniAction onPress={pickImage}>
                <Camera color="#15803d" size={18} />
                <MiniLabel>{image ? "IMAGE ATTACHED" : "ADD PHOTO"}</MiniLabel>
            </MiniAction>
        </LogisticsRow>

        {image && <ImagePreview source={{ uri: image }} />}

        {showDatePicker && (
          <DateTimePicker value={form.scheduledDate} mode="date" display="default"
            onChange={(e, d) => { setShowDatePicker(false); if(d) setForm({...form, scheduledDate: d}); }}
          />
        )}

        {/* SUBMIT MISSION */}
        <SubmitArea>
            <TouchableOpacity onPress={handleSubmit} disabled={loading || locLoading}>
                <LinearGradient 
                    colors={['#064e3b', '#15803d']} 
                    style={{ padding: 20, borderRadius: 20, alignItems: 'center', elevation: 8, shadowOpacity: 0.3, shadowRadius: 10 }}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <SubmitText>START COLLECTION MISSION</SubmitText>}
                </LinearGradient>
            </TouchableOpacity>
        </SubmitArea>

      </ScrollView>
    </Container>
  );
};

// --- PREMIUM STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 20px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 900; color: #0f172a; `;

const StepHeader = styled.View` flex-direction: row; align-items: center; margin-top: 30px; margin-bottom: 15px; gap: 10px; `;
const StepNum = styled.Text` font-size: 24px; font-weight: 900; color: #f1f5f9; position: absolute; left: -5px; top: -10px; `;
const StepLabel = styled.Text` font-size: 11px; font-weight: 800; color: #cbd5e1; letter-spacing: 1.5px; margin-left: 20px; `;

const CategoryGrid = styled.View` flex-direction: row; flex-wrap: wrap; gap: 10px; `;
const CategoryCard = styled.TouchableOpacity` width: 31%; aspect-ratio: 1; background: ${props => props.active ? '#f0fdf4' : '#f8fafc'}; border-radius: 20px; border: 2px solid ${props => props.active ? '#15803d' : '#f1f5f9'}; justify-content: center; align-items: center; `;
const CatLabel = styled.Text` font-size: 10px; font-weight: 800; margin-top: 8px; color: ${props => props.active ? '#15803d' : '#94a3b8'}; `;

const GPSAction = styled.TouchableOpacity` background: ${props => props.hasCoords ? '#16a34a' : '#0f172a'}; padding: 18px; border-radius: 20px; flex-direction: row; justify-content: center; align-items: center; gap: 12px; margin-bottom: 15px; elevation: 4; `;
const GPSText = styled.Text` color: #fff; font-weight: 900; font-size: 12px; letter-spacing: 0.5px; `;

const InputBox = styled.View` flex-direction: row; align-items: center; background: #f8fafc; border-radius: 15px; border: 1px solid #e2e8f0; padding: 14px 15px; `;
const StyledInput = styled.TextInput` flex: 1; margin-left: 10px; font-size: 15px; font-weight: 700; color: #0f172a; `;

const LogisticsRow = styled.View` flex-direction: row; gap: 12px; margin-top: 5px; `;
const MiniAction = styled.TouchableOpacity` flex: 1; background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 15px; flex-direction: row; align-items: center; gap: 10px; `;
const MiniLabel = styled.Text` font-size: 11px; font-weight: 800; color: #15803d; `;

const ImagePreview = styled.Image` width: 100%; height: 180px; border-radius: 20px; margin-top: 20px; background: #f8fafc; `;
const SubmitArea = styled.View` margin-top: 40px; margin-bottom: 50px; `;
const SubmitText = styled.Text` color: #fff; font-size: 14px; font-weight: 900; letter-spacing: 1px; `;

export default NewRequestScreen;