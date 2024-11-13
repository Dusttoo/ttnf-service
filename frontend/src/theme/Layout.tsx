import React from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminToolbar from '../components/admin/Toolbar';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Breadcrumb from '../components/common/Breadcrumb';
import AnnouncementSection from '../components/common/Announcement';
import { useAnnouncementsByPageId } from '../hooks/useAnnouncements';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
  align-items: center;
`;

const Layout: React.FC<{ pageId: string }> = ({ pageId }) => {
  // Fetch announcements for the current page
  const { data: announcements = [] } = useAnnouncementsByPageId(pageId);

  return (
    <PageContainer>
      <AdminToolbar />
      <Header />
      <ContentContainer>
        <Breadcrumb />
        <ErrorBoundary>
          {announcements.length > 0 && (
            <AnnouncementSection
              title="Latest Announcements"
              announcements={announcements}
            />
          )}
          <Outlet />
        </ErrorBoundary>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default Layout;