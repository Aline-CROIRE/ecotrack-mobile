import React, { useContext } from 'react';
import styled from 'styled-components/native';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <Container>
      <ProfileHeader>
        <Avatar>{user?.name?.charAt(0)}</Avatar>
        <Name>{user?.name}</Name>
        <Email>{user?.email}</Email>
      </ProfileHeader>
      <LogoutBtn onPress={logout}><LogoutText>Log Out</LogoutText></LogoutBtn>
    </Container>
  );
};

const Container = styled.View` flex: 1; padding: 20px; background: #fff; `;
const ProfileHeader = styled.View` alignItems: center; marginTop: 60px; `;
const Avatar = styled.Text` width: 80px; height: 80px; borderRadius: 40px; background: #2ECC71; textAlign: center; lineHeight: 80px; fontSize: 32px; color: #fff; fontWeight: bold; `;
const Name = styled.Text` fontSize: 24px; fontWeight: bold; marginTop: 15px; `;
const Email = styled.Text` color: #64748b; `;
const LogoutBtn = styled.TouchableOpacity` marginTop: auto; marginBottom: 30px; background: #fee2e2; padding: 18px; borderRadius: 15px; alignItems: center; `;
const LogoutText = styled.Text` color: #ef4444; fontWeight: bold; fontSize: 16px; `;

export default ProfileScreen;