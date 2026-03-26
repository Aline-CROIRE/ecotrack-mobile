import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { ChevronLeft, User, CheckCircle } from 'lucide-react-native';
import apiClient from '../api/client';

const AdminUserListScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    try {
      const res = await apiClient.get('/auth/users');
      setCollectors(res.data.data.filter(u => u.role === 'collector'));
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleReassign = async (collectorId) => {
    try {
      await apiClient.put(`/requests/${requestId}/assign`, { collectorId });
      Alert.alert("Success", "Collector Re-assigned successfully!");
      navigation.navigate('Main');
    } catch (e) { Alert.alert("Error", "Assignment failed"); }
  };

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" size={28} /></TouchableOpacity>
        <Title>Select Collector</Title>
        <View style={{ width: 28 }} />
      </Header>

      {loading ? <ActivityIndicator size="large" color="#15803d" /> : (
        <FlatList
          data={collectors}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <UserCard onPress={() => handleReassign(item._id)}>
              <Avatar><User color="#fff" size={20} /></Avatar>
              <Info>
                <Name>{item.name}</Name>
                <Phone>{item.phone}</Phone>
              </Info>
              <CheckCircle color="#15803d" size={20} />
            </UserCard>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </Container>
  );
};

const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const Title = styled.Text` font-size: 18px; font-weight: 800; `;
const UserCard = styled.TouchableOpacity` flex-direction: row; align-items: center; background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 10px; `;
const Avatar = styled.View` width: 40px; height: 40px; border-radius: 20px; background: #15803d; justify-content: center; align-items: center; `;
const Info = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-weight: 700; `;
const Phone = styled.Text` font-size: 12px; color: #64748b; `;

export default AdminUserListScreen;