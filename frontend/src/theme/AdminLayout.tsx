import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/admin/dashboard/AdminSidebar';
import {Outlet} from 'react-router-dom';
import ErrorBoundary from "../components/common/ErrorBoundary";

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
`;

const AdminLayout: React.FC = () => {
    return (
        <LayoutContainer>
            <Sidebar/>
            <MainContent>
                <ErrorBoundary>
                    <Outlet/>
                </ErrorBoundary>
            </MainContent>
        </LayoutContainer>
    );
};

export default AdminLayout;