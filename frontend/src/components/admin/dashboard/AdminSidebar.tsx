import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../../images/logo.png'

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
const NavLinkStyled = styled(Link)`
  color: ${(props) => props.theme.colors.white};
  text-decoration: none;
  margin-left: 2rem;
  font-size: 1rem;
  transition: color 0.3s, text-decoration 0.3s;

  &:link,
  &:visited {
    color: ${(props) => props.theme.colors.white};
  }

  &:hover {
    text-decoration: underline;
    text-underline-offset: 6px;
  }

  &:focus {
    color: ${(props) => props.theme.colors.accent};
    outline: none;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:active {
    color: ${(props) => props.theme.colors.secondary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Logo = styled.img`
  width: 80px;
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <NavLinkStyled to="/"><Logo src={logo} alt="Logo" /></NavLinkStyled>
      <h2>Admin</h2>
      <NavItem onClick={() => navigate('/admin/dashboard')}>Dashboard</NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/pages')}>
        Pages
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/dogs')}>Dogs</NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/productions')}>
        Productions
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/available')}>
        Available
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/breedings')}>
        Breedings
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/litters')}>
        Litters
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/waitlist')}>
        Waitlist
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/contact')}>
        Contact
      </NavItem>
      <NavItem onClick={() => navigate('/admin/dashboard/settings')}>
        Settings
      </NavItem>
    </SidebarContainer>
  );
};

export default Sidebar;
