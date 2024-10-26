import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.white};
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.primary};
`;

const FooterLinks = styled.div`
  margin: 1rem 0;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  a {
    color: ${(props) => props.theme.colors.white};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;

const SocialIcons = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;

  a {
    color: ${(props) => props.theme.colors.white};
    font-size: 1.2rem;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;

const Copyright = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.primary};
  margin-top: 1rem;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterLinks>
        <a href="/about">About Us</a>
        <a href="/services">Our Services</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
      </FooterLinks>
      <SocialIcons>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
      </SocialIcons>
      <Copyright>&copy; {new Date().getFullYear()} Texas Top Notch Frenchies. All rights reserved.</Copyright>
    </FooterContainer>
  );
};

export default Footer;