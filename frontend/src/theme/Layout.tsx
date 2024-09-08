import React from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminToolbar from '../components/admin/Toolbar';
import { Outlet } from 'react-router-dom';

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
`;

const Layout: React.FC = () => {
    return (
        <PageContainer>
            <AdminToolbar />
            <Header />
            <ContentContainer>
                <Outlet />
            </ContentContainer>
            <Footer />
        </PageContainer>
    );
};

export default Layout;