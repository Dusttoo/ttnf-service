import React from 'react';
import styled from 'styled-components';
import SearchBar from "../../common/SearchBar";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
`;

const StatCard = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
`;

const QuickLinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuickLinkButton = styled.a`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const AdminLayout: React.FC = () => {
  return (
        <DashboardContainer>
          <WelcomeSection>
            <h2>Welcome to the Admin Dashboard!</h2>
            <p>Manage your site with ease using the options below.</p>
          </WelcomeSection>

          <SearchBar resources={['pages', 'dogs', 'users']} onResultSelect={() => {}} />

          <QuickStatsSection>
            <StatCard>
              <h3>25</h3>
              <p>Pages</p>
            </StatCard>
            <StatCard>
              <h3>8</h3>
              <p>Dogs</p>
            </StatCard>
            <StatCard>
              <h3>3</h3>
              <p>Pending Tasks</p>
            </StatCard>
          </QuickStatsSection>

          <QuickLinksSection>
            <QuickLinkButton href="/admin/dashboard/pages">Add a New Page</QuickLinkButton>
            <QuickLinkButton href="/admin/dashboard/dogs">Manage Dogs</QuickLinkButton>
            <QuickLinkButton href="/admin/dashboard/breedings">Add a Breeding</QuickLinkButton>
            <QuickLinkButton href="/admin/dashboard/settings">Site Settings</QuickLinkButton>
          </QuickLinksSection>
        </DashboardContainer>
  );
};

export default AdminLayout;