// src/components/admin/AdminLayout.tsx

import React from 'react';
import styled from 'styled-components';
import SearchBar from '../../common/SearchBar';
import { useAdminStats } from '../../../hooks/useAdmin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faPaw, faTasks, faGear, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
`;

const WelcomeSection = styled.div`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 2rem;
  border-radius: 8px;
`;

const QuickStatsSection = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ClickableStatCard = styled(Link)`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
    transform: scale(1.02);
  }
`;

const NonClickableStatCard = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.h3`
  font-size: 2rem;
  margin: 0.5rem 0;
  color: ${(props) => props.theme.colors.primary};
`;

const StatDescription = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
`;

const QuickLinksSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const QuickLinkButton = styled.a`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const AdminLayout: React.FC = () => {
  const { data: stats, isError, error } = useAdminStats();

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h2>Welcome to the Admin Dashboard!</h2>
        <p>Manage your site with ease using the options below.</p>
      </WelcomeSection>

      <SearchBar resources={['pages', 'dogs', 'users']} onResultSelect={() => {}} />

      <QuickStatsSection>
        {isError ? (
          <NonClickableStatCard>
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" color="#E74C3C" />
            <StatNumber>Error</StatNumber>
            <StatDescription>{error?.message || 'Failed to load stats'}</StatDescription>
          </NonClickableStatCard>
        ) : (
          <>
            {/* Contact Submissions Stat Card */}
            <ClickableStatCard to="/admin/dashboard/contact">
              <FontAwesomeIcon icon={faFileAlt} size="2x" color="#4A90E2" />
              <StatNumber>{stats?.contactSubmissions}</StatNumber>
              <StatDescription>Contact Submissions</StatDescription>
            </ClickableStatCard>

            {/* Waitlist Submissions Stat Card */}
            <ClickableStatCard to="/admin/dashboard/waitlist">
              <FontAwesomeIcon icon={faPaw} size="2x" color="#50E3C2" />
              <StatNumber>{stats?.waitlistSubmissions}</StatNumber>
              <StatDescription>Waitlist Submissions</StatDescription>
            </ClickableStatCard>

            {/* Pending Tasks Stat Card (Optional: Make it dynamic later) */}
            {/* <NonClickableStatCard>
              <FontAwesomeIcon icon={faTasks} size="2x" color="#F5A623" />
              <StatNumber>3</StatNumber>
              <StatDescription>Pending Tasks</StatDescription>
            </NonClickableStatCard> */}
          </>
        )}
      </QuickStatsSection>

      <QuickLinksSection>
        <QuickLinkButton href="/admin/dashboard/pages">
          <FontAwesomeIcon icon={faFileAlt} />
          Add a New Page
        </QuickLinkButton>
        <QuickLinkButton href="/admin/dashboard/dogs">
          <FontAwesomeIcon icon={faPaw} />
          Manage Dogs
        </QuickLinkButton>
        <QuickLinkButton href="/admin/dashboard/breedings">
          <FontAwesomeIcon icon={faPlus} />
          Add a Breeding
        </QuickLinkButton>
        <QuickLinkButton href="/admin/dashboard/settings">
          <FontAwesomeIcon icon={faGear} />
          Site Settings
        </QuickLinkButton>
      </QuickLinksSection>
    </DashboardContainer>
  );
};

export default AdminLayout;