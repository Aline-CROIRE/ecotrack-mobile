import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Star, X, CheckCircle } from 'lucide-react-native';
import apiClient from '../api/client';

const RatingModal = ({ isVisible, onClose, requestId, collectorName }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert("Wait", "Please select a star rating.");
    setLoading(true);
    try {
      await apiClient.post('/ratings', { requestId, rating });
      Alert.alert("Thank You!", "Your feedback helps keep our city clean.");
      onClose();
    } catch (e) {
      Alert.alert("Error", "You have already rated this collection.");
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <Overlay>
        <ModalCard>
          <CloseBtn onPress={onClose}><X color="#94a3b8" size={24} /></CloseBtn>
          <IconCircle><CheckCircle color="#15803d" size={40} /></IconCircle>
          <Title>Mission Complete!</Title>
          <Sub>How was your experience with {collectorName || 'your collector'}?</Sub>
          
          <StarRow>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Star size={35} color={rating >= s ? "#f59e0b" : "#e2e8f0"} fill={rating >= s ? "#f59e0b" : "transparent"} />
              </TouchableOpacity>
            ))}
          </StarRow>

          <SubmitBtn onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <BtnText>SUBMIT FEEDBACK</BtnText>}
          </SubmitBtn>
        </ModalCard>
      </Overlay>
    </Modal>
  );
};

const Overlay = styled.View` flex: 1; background: rgba(0,0,0,0.6); justify-content: center; padding: 30px; `;
const ModalCard = styled.View` background: #fff; border-radius: 30px; padding: 30px; align-items: center; position: relative; `;
const CloseBtn = styled.TouchableOpacity` position: absolute; top: 20px; right: 20px; `;
const IconCircle = styled.View` width: 80px; height: 80px; border-radius: 40px; background: #f0fdf4; justify-content: center; align-items: center; margin-bottom: 20px; `;
const Title = styled.Text` font-size: 22px; font-weight: 900; color: #0f172a; `;
const Sub = styled.Text` text-align: center; color: #64748b; margin-top: 10px; font-weight: 600; line-height: 20px; `;
const StarRow = styled.View` flex-direction: row; gap: 10px; margin-top: 30px; margin-bottom: 40px; `;
const SubmitBtn = styled.TouchableOpacity` background: #15803d; width: 100%; padding: 18px; border-radius: 15px; align-items: center; elevation: 5; `;
const BtnText = styled.Text` color: #fff; font-weight: 900; letter-spacing: 1px; `;

export default RatingModal;