import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import notFoundImage from '../images/404.png'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.neutralBackground};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Heading = styled.h1`
  font-size: 5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Message = styled.p`
  font-size: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

const HomeButton = styled(Link)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Image = styled.img`
  width: 300px;
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  margin-top: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  margin-right: 1rem;
  margin-bottom: 1rem;
  max-width: 400px;
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <Heading>404</Heading>
      <Image src={notFoundImage} alt="404 Illustration" />
      <Message>Oops! The page you’re looking for doesn’t exist.</Message>
      <HomeButton to="/">Go to Home</HomeButton>

      <SearchContainer>
        <SearchInput placeholder="Search our site..." />
        <SearchButton>Search</SearchButton>
      </SearchContainer>
    </Container>
  );
};

export default NotFoundPage;