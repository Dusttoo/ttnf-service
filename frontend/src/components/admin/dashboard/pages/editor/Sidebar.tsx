import React, { useState } from 'react';
import styled from 'styled-components';
import { SEOSettings, LayoutSettings } from '../../../../../api/types/page';
import Checkbox from '../../../../common/form/Checkbox';
interface SidebarProps {
  seoSettings: SEOSettings;
  setSEOSettings: React.Dispatch<React.SetStateAction<SEOSettings>>;
  layoutSettings: LayoutSettings;
  setLayoutSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
}

const SidebarContainer = styled.div`
  width: 300px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionContainer = styled.div`
  margin-bottom: 1rem;
`;

const SectionHeader = styled.h3`
  margin: 0;
  padding: 0.5rem 0;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionContent = styled.div<{ isVisible: boolean }>`
  padding: 0.5rem 0;
  display: ${(props) => (props.isVisible ? 'block' : 'none')};
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const FileInput = styled.input`
  width: 100%;
  margin: 0.5rem 0;
`;

const Label = styled.label`
  margin: 0.5rem 0;
  font-weight: bold;
`;

const ToggleIcon = styled.span`
  font-size: 1.2rem;
  cursor: pointer;
`;

const Sidebar: React.FC<SidebarProps> = ({
  seoSettings,
  setSEOSettings,
  layoutSettings,
  setLayoutSettings,
}) => {
  const [isSEOSettingsVisible, setSEOSettingsVisible] = useState(true);
  const [isLayoutSettingsVisible, setLayoutSettingsVisible] = useState(true);

  return (
    <SidebarContainer>
      <SectionContainer>
        <SectionHeader>Page Settings</SectionHeader>
        <div>
          <Label>Page Title</Label>
          <InputField type="text" placeholder="Enter Page Title" />
          <Label>Slug</Label>
          <InputField type="text" placeholder="Enter Page Slug" />
        </div>
      </SectionContainer>

      <SectionContainer>
        <SectionHeader
          onClick={() => setSEOSettingsVisible(!isSEOSettingsVisible)}
        >
          SEO Settings{' '}
          <ToggleIcon>{isSEOSettingsVisible ? '▼' : '▲'}</ToggleIcon>
        </SectionHeader>
        <SectionContent isVisible={isSEOSettingsVisible}>
          <Label>SEO Title</Label>
          <InputField type="text" placeholder="Enter SEO Title" />
          <Label>Description</Label>
          <InputField type="text" placeholder="Enter SEO Description" />
          <Label>Keywords</Label>
          <InputField type="text" placeholder="Enter Keywords" />
        </SectionContent>
      </SectionContainer>

      <SectionContainer>
        <SectionHeader
          onClick={() => setLayoutSettingsVisible(!isLayoutSettingsVisible)}
        >
          Layout Settings{' '}
          <ToggleIcon>{isLayoutSettingsVisible ? '▼' : '▲'}</ToggleIcon>
        </SectionHeader>
        <SectionContent isVisible={isLayoutSettingsVisible}>
          <Checkbox
            label="Show Header"
            checked={layoutSettings?.header || false}
            onChange={(checked) =>
              setLayoutSettings({ ...layoutSettings, header: checked })
            }
          />
          <Checkbox
            label="Show Footer"
            checked={layoutSettings?.footer || false}
            onChange={(checked) =>
              setLayoutSettings({ ...layoutSettings, footer: checked })
            }
          />
        </SectionContent>
      </SectionContainer>

      <SectionContainer>
        <Label>Upload Image</Label>
        <FileInput type="file" />
      </SectionContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
