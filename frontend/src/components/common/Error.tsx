import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa'; // Optional: icon for better user recognition

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.neutralBackground};
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const ErrorIcon = styled(FaExclamationTriangle)`
  color: ${({ theme }) => theme.colors.error};
  font-size: 4rem;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  margin-bottom: 10px;
`;

const ErrorDetails = styled.p`
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: 1.2rem;
  margin-bottom: 20px;
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.ui.button.primary.background};
  color: ${({ theme }) => theme.ui.button.primary.color};
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.primary};
  transition: background-color 0.3s ease;
  animation: ${pulse} 1.5s infinite ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.ui.button.secondary.background};
    color: ${({ theme }) => theme.ui.button.secondary.color};
  }
`;

interface ErrorComponentProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ message = "Oops! Something went wrong.", onRetry }) => {
  return (
    <ErrorContainer>
      <ErrorIcon />
      <ErrorMessage>{message}</ErrorMessage>
      <ErrorDetails>Please try again later, or contact support if the problem persists.</ErrorDetails>
      {onRetry && (
        <RetryButton onClick={onRetry}>
          Try Again
        </RetryButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorComponent;