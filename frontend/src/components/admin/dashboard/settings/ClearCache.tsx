import React, { useState } from 'react';
import GlobalModal from '../../../common/Modal';
import ErrorComponent from '../../../common/Error';
import styled from 'styled-components';
import { clearCache } from '../../../../api/utilsApi';

const CachePageContainer = styled.div`
  background-color: ${(props) => props.theme.colors.neutralBackground};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.secondary};
  font-family: ${(props) => props.theme.fonts.secondary};
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.ui.button.primary.background};
  color: ${(props) => props.theme.ui.button.primary.color};
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.primary};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.ui.button.secondary.background};
    color: ${(props) => props.theme.ui.button.secondary.color};
  }
`;

const ClearCacheComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleClearCache = async () => {
    try {
      await clearCache();
      setIsError(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setErrorMessage('Failed to clear cache. Please try again.');
      setIsError(true);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsError(false);
    setErrorMessage(undefined);
  };

  const handleRetry = () => {
    setIsModalOpen(false);
    setErrorMessage(undefined);
    handleClearCache();
  };

  return (
    <CachePageContainer>
      <SectionTitle>Cache Management</SectionTitle>
      <Description>Not seeing recent updates, like a new dog you added or pictures not showing up correctly? Try using the button below to refresh the system and clear the cache.</Description>
      <Button onClick={handleClearCache}>Clear Cache</Button>

      <GlobalModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {isError ? (
          <ErrorComponent message={errorMessage} onRetry={handleRetry} />
        ) : (
          <div>
            <h2>Cache cleared successfully!</h2>
            <p>The Redis cache was cleared. You can continue using the application without any issues.</p>
            <Button onClick={handleCloseModal}>OK</Button>
          </div>
        )}
      </GlobalModal>
    </CachePageContainer>
  );
};

export default ClearCacheComponent;