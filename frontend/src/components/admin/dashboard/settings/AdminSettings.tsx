import React from 'react';
import styled from 'styled-components';
import ClearCacheComponent from './ClearCache';

const SettingsWrapper = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  max-width: 900px;
  height: 90vh;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h1`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  margin-bottom: 32px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
`;

const Tab = styled.div<{ active?: boolean }>`
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.text)};
  border-bottom: ${({ active, theme }) => (active ? `2px solid ${theme.colors.primary}` : 'none')};
  margin-right: 16px;
`;

const AdminSettings: React.FC = () => {
  const handleTabClick = (tab: string) => {
    console.log(`Switched to ${tab} tab`);
  };

  return (
    <SettingsWrapper>
      <SectionTitle>Website Settings</SectionTitle>
      <Description>Manage different settings for your website and pages.</Description>

      <TabsContainer>
        <Tab active={true} onClick={() => handleTabClick('Calls')}>
          Calls
        </Tab>
        <Tab onClick={() => handleTabClick('Messages')}>Messages</Tab>
        <Tab onClick={() => handleTabClick('Users')}>Users</Tab>
        <Tab onClick={() => handleTabClick('Integrations')}>Integrations</Tab>
      </TabsContainer>

      <ClearCacheComponent />
    </SettingsWrapper>
  );
};

export default AdminSettings;