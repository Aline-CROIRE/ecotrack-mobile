import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

const RequestsScreen = () => (
  <Container><Title>Waste Pickups</Title><Description>Track your active collection tasks here.</Description></Container>
);

const Container = styled.View` flex: 1; justifyContent: center; alignItems: center; background: #fff; `;
const Title = styled.Text` fontSize: 22px; fontWeight: bold; color: #2ECC71; `;
const Description = styled.Text` color: #64748b; `;

export default RequestsScreen;