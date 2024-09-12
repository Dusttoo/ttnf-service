import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.neutralBackground};
  flex-direction: column;
`;

const Spinner = styled.div`
  border: 6px solid ${({ theme }) => theme.colors.secondaryBackground};
  border-top: 6px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.h2`
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingSpinner: React.FC = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;