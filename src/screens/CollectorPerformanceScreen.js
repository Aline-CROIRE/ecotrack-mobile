import React, { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ChevronLeft, Award, User, 
  MessageCircle, Phone, Target, Star 
} from 'lucide-react-native';
import apiClient from '../api/client';

const CollectorPerformanceScreen = ({ navigation }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    try {
      const res = await apiClient.get('/analytics/admin-overview');
      setRankings(res.data.rankings || []);
    } catch (e) { console.log("Rankings Error"); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchRankings(); }, []));

  const renderItem = ({ item, index }) => {
    // Determine Medal
    const getMedalColor = (i) => {
        if (i === 0) return "#f59e0b"; // Gold
        if (i === 1) return "#94a3b8"; // Silver
        if (i === 2) return "#b45309"; // Bronze
        return "#f1f5f9";
    };

    return (
      <RankCard>
        <CardTop>
            <BadgeWrapper bg={getMedalColor(index)}>
                {index < 3 ? <Award color="#fff" size={18} /> : <RankNum>{index + 1}</RankNum>}
            </BadgeWrapper>
            <UserInfo>
                <Name>{item.name}</Name>
                {/* DYNAMIC RATING DISPLAY */}
                <RatingRow>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <RatingText>{item.averageRating ? item.averageRating.toFixed(1) : "Unrated"}</RatingText>
                    <Separator>•</Separator>
                    <CountText>{item.completedCount} Cleanups</CountText>
                </RatingRow>
            </UserInfo>
            <ActionRow>
                <IconBtn bg="#f0fdf4" onPress={() => navigation.navigate('ChatRoom', { partner: { ...item, id: item._id } })}>
                    <MessageCircle color="#15803d" size={18} />
                </IconBtn>
                <IconBtn bg="#f8fafc" onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                    <Phone color="#0f172a" size={18} />
                </IconBtn>
            </ActionRow>
        </CardTop>

        <PerformanceMeterContainer>
            <PerformanceLabel>MISSION SUCCESS RATE</PerformanceLabel>
            <ProgressBarContainer>
                <ProgressBarFill 
                    width={item.completedCount + item.pendingCount > 0 
                      ? (item.completedCount / (item.completedCount + item.pendingCount)) * 100 
                      : 0} 
                />
            </ProgressBarContainer>
        </PerformanceMeterContainer>
      </RankCard>
    );
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }} />

      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#0f172a" size={30} /></TouchableOpacity>
        <TitleSection>
            <Title>Personnel ROI</Title>
            <Subtitle>QUALITY & EFFICIENCY SCORE</Subtitle>
        </TitleSection>
        <Target color="#15803d" size={24} />
      </Header>

      {loading ? (
        <Centered><ActivityIndicator size="large" color="#15803d" /></Centered>
      ) : (
        <FlatList
          data={rankings}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          ListHeaderComponent={<SectionLabel>Top Ranked Field Staff</SectionLabel>}
        />
      )}
    </Container>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled.View` flex: 1; background: #f8fafc; `;
const Centered = styled.View` flex: 1; justify-content: center; align-items: center; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 20px 25px; background: #fff; border-bottom-width: 1px; border-bottom-color: #f1f5f9; `;
const TitleSection = styled.View` align-items: center; `;
const Title = styled.Text` font-size: 20px; font-weight: 900; color: #0f172a; `;
const Subtitle = styled.Text` font-size: 10px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; `;
const SectionLabel = styled.Text` font-size: 12px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1.5px; `;
const RankCard = styled.View` background: #fff; border-radius: 24px; padding: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; elevation: 3; `;
const CardTop = styled.View` flex-direction: row; align-items: center; margin-bottom: 20px; `;
const BadgeWrapper = styled.View` width: 40px; height: 40px; border-radius: 12px; background: ${props => props.bg}; justify-content: center; align-items: center; `;
const RankNum = styled.Text` color: #94a3b8; font-weight: 900; font-size: 16px; `;
const UserInfo = styled.View` flex: 1; margin-left: 15px; `;
const Name = styled.Text` font-size: 16px; font-weight: 800; color: #1e293b; `;
const RatingRow = styled.View` flex-direction: row; align-items: center; margin-top: 4px; `;
const RatingText = styled.Text` font-size: 12px; font-weight: 800; color: #f59e0b; margin-left: 4px; `;
const Separator = styled.Text` color: #cbd5e1; margin: 0 6px; `;
const CountText = styled.Text` font-size: 11px; color: #94a3b8; font-weight: 700; `;
const ActionRow = styled.View` flex-direction: row; gap: 8px; `;
const IconBtn = styled.TouchableOpacity` width: 38px; height: 38px; border-radius: 12px; background: ${props => props.bg}; justify-content: center; align-items: center; border: 1px solid #f1f5f9; `;
const PerformanceMeterContainer = styled.View``;
const PerformanceLabel = styled.Text` font-size: 9px; font-weight: 900; color: #cbd5e1; letter-spacing: 1px; margin-bottom: 8px; `;
const ProgressBarContainer = styled.View` width: 100%; height: 6px; background: #f8fafc; border-radius: 3px; overflow: hidden; border: 1px solid #f1f5f9; `;
const ProgressBarFill = styled.View` width: ${props => props.width}%; height: 100%; background: #16a34a; border-radius: 3px; `;

export default CollectorPerformanceScreen;