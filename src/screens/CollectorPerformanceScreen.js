import React, { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Award, TrendingUp, User } from 'lucide-react-native';
import apiClient from '../api/client';

const CollectorPerformanceScreen = ({ navigation }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    try {
      const res = await apiClient.get('/analytics/admin-overview');
      setRankings(res.data.rankings);
    } catch (e) { console.log("Rankings Error"); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchRankings(); }, []));

  const renderItem = ({ item, index }) => (
    <RankCard index={index}>
      <Badge index={index}><RankNum index={index}>{index + 1}</RankNum></Badge>
      <Info>
        <Name>{item.name}</Name>
        <Stats>{item.completedCount} Cleanups Completed</Stats>
      </Info>
      <EfficiencyScore>
        <TrendingUp size={14} color="#16a34a" />
        <ScoreText>{Math.round((item.completedCount / (item.completedCount + item.pendingCount || 1)) * 100)}%</ScoreText>
      </EfficiencyScore>
    </RankCard>
  );

  return (
    <Container>
      <Header>
        <BackBtn onPress={() => navigation.goBack()}><ChevronLeft color="#0f172a" size={28} /></BackBtn>
        <Title>Collector ROI</Title>
        <View style={{ width: 28 }} />
      </Header>

      {loading ? <Centered><ActivityIndicator size="large" color="#15803d" /></Centered> : (
        <FlatList
          data={rankings}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          ListHeaderComponent={<SectionLabel>City-wide Leaderboard</SectionLabel>}
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled(SafeAreaView)` flex: 1; background: #fff; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const BackBtn = styled.TouchableOpacity``;
const Title = styled.Text` font-size: 20px; font-weight: 800; `;
const Centered = styled.View` flex: 1; justify-content: center; `;
const SectionLabel = styled.Text` font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 20px; `;
const RankCard = styled.View` flex-direction: row; align-items: center; background: #f8fafc; padding: 16px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; `;
const Badge = styled.View` width: 36px; height: 36px; border-radius: 18px; background: ${props => props.index === 0 ? '#f59e0b' : '#e2e8f0'}; justify-content: center; align-items: center; `;
const RankNum = styled.Text` font-weight: 900; color: ${props => props.index === 0 ? '#fff' : '#64748b'}; `;
const Info = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-size: 16px; font-weight: 700; `;
const Stats = styled.Text` font-size: 12px; color: #64748b; margin-top: 2px; `;
const EfficiencyScore = styled.View` background: #dcfce7; padding: 6px 12px; border-radius: 10px; flex-direction: row; align-items: center; gap: 5px; `;
const ScoreText = styled.Text` color: #16a34a; font-weight: 800; font-size: 12px; `;

export default CollectorPerformanceScreen;