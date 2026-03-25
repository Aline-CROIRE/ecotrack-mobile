import React from 'react';
import styled from 'styled-components/native';

const ReportsScreen = () => (
  <Container><Title>Issue Reports</Title><Description>Report illegal dumping or pickup issues.</Description></Container>
);

const Container = styled.View` flex: 1; justifyContent: center; alignItems: center; background: #fff; `;
const Title = styled.Text` fontSize: 22px; fontWeight: bold; color: #E74C3C; `;
const Description = styled.Text` color: #64748b; `;

export default ReportsScreen;