import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Navigation from '../navigation/Navigation';

const HeaderContainer = styled.header`
  background-color: ${(props) => props.theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 999;
  padding-top: 3.5rem;
`;

const Logo = styled.img`
  height: 80px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: flex-end;
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

const Header = () => {

    return (
        <HeaderContainer>
            <NavLinkStyled to="/"><Logo src="https://ttnf.blob.core.windows.net/ttnf/logoLight.png" alt="Logo" /></NavLinkStyled>
            <Navigation />
        </HeaderContainer>
    );
};

export default Header;