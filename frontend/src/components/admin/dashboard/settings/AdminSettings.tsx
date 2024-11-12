import React, { useState } from 'react';
import styled from 'styled-components';
import ClearCacheComponent from './ClearCache';
import AnnouncementManager from './Announcements';

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

const TabContent = styled.div`
  margin-top: 16px;
`;

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Calls');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SettingsWrapper>
      <SectionTitle>Website Settings</SectionTitle>
      <Description>Manage different settings for your website and pages.</Description>

      <TabsContainer>
        {/* <Tab active={activeTab === 'Calls'} onClick={() => handleTabClick('Calls')}>
          Calls
        </Tab>
        <Tab active={activeTab === 'Messages'} onClick={() => handleTabClick('Messages')}>
          Messages
        </Tab>
        <Tab active={activeTab === 'Users'} onClick={() => handleTabClick('Users')}>
          Users
        </Tab>
        <Tab active={activeTab === 'Integrations'} onClick={() => handleTabClick('Integrations')}>
          Integrations
        </Tab> */}
        <Tab active={activeTab === 'Announcements'} onClick={() => handleTabClick('Announcements')}>
          Announcements
        </Tab>
        <Tab active={activeTab === 'Cache'} onClick={() => handleTabClick('Cache')}>
          Cache
        </Tab>
      </TabsContainer>

      <TabContent>
        {/* {activeTab === 'Calls' && <p>Calls settings content goes here...</p>}
        {activeTab === 'Messages' && <p>Messages settings content goes here...</p>}
        {activeTab === 'Users' && <p>Users settings content goes here...</p>}
        {activeTab === 'Integrations' && <p>Integrations settings content goes here...</p>} */}
        {activeTab === 'Announcements' && <AnnouncementManager />}
        {activeTab === 'Cache' && <ClearCacheComponent />}
      </TabContent>
    </SettingsWrapper>
  );
};

export default AdminSettings;