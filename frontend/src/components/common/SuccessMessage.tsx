import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa'; // Icon for success message

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  text-align: center;
  color: #155724;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const SuccessIcon = styled(FaCheckCircle)`
  color: #28a745;
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SuccessMessageText = styled.h3`
  font-family: ${({ theme }) => theme.fonts.primary};
  color: #155724;
  margin-bottom: 1rem;
`;

const SuccessDetails = styled.p`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: 1.2rem;
  color: #155724;
`;

const SuccessButton = styled.button`
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

interface SuccessMessageProps {
  message: string;
  detail?: string;
  onClose?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  detail,
  onClose,
}) => {
  return (
    <SuccessContainer>
      <SuccessIcon />
      <SuccessMessageText>{message}</SuccessMessageText>
      {detail ? (
        <SuccessDetails>{detail}</SuccessDetails>
      ) : (
        <SuccessDetails>Your operation was successful!</SuccessDetails>
      )}

      {onClose && <SuccessButton onClick={onClose}>Close</SuccessButton>}
    </SuccessContainer>
  );
};

export default SuccessMessage;
