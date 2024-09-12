import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { selectIsAuthenticated } from '../../store/authSlice';
import { Link } from 'react-router-dom';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #333;
  color: #fff;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
`;

const Button = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const DashboardLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  margin-left: 1rem;

  &:hover {
    background: ${(props) => props.theme.colors.secondary};
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1rem;
  margin-right: auto;
`;

const AdminToolbar: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  if (!isAuthenticated) return null;

  return (
    <ToolbarContainer>
      <WelcomeMessage>
        {currentUser?.firstName ? `Welcome, ${currentUser.firstName}` : 'Welcome, Admin'}
      </WelcomeMessage>

      {isAuthenticated && (
        <>
          <DashboardLink to="/admin/dashboard">Dashboard</DashboardLink>
        </>
      )}
    </ToolbarContainer>
  );
};

export default AdminToolbar;