import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 300px;
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.sidebarBackground};
  border-left: 1px solid ${(props) => props.theme.colors.border};
`;

const Sidebar: React.FC = () => {
    return (
        <SidebarContainer>
            <h3>Page Settings</h3>
            {/* Form for page title, slug, etc. */}
            <div>
                <label>Page Title</label>
                <input type="text" placeholder="Page Title" />
            </div>
            <div>
                <label>SEO Settings</label>
                <input type="text" placeholder="SEO Title" />
            </div>
            <div>
                <label>Upload Image</label>
                <input type="file" />
            </div>
        </SidebarContainer>
    );
};

export default Sidebar;