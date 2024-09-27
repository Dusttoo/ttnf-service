import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SidebarContainer = styled.div`
  width: 150px;
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.white};
  padding: 2rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
`;

const NavItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
  }
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <h2>Admin</h2>
      <NavItem onClick={() => navigate('/admin/dashboard')}>Dashboard</NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/pages')}>
        Pages
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/dogs')}>Dogs</NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/productions')}>
        Productions
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/breedings')}>
        Breedings
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/litters')}>
        Litters
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/settings')}>
        Settings
      </NavItem>
    </SidebarContainer>
  );
};

export default Sidebar;
