import React, { useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { SEOSettings, LayoutSettings, Page } from '../../../../../api/types/page';
import Checkbox from '../../../../common/form/Checkbox';
import CarouselEdit from './CarouselEditor';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';

interface SidebarProps {
  seoSettings: SEOSettings;
  setSEOSettings: React.Dispatch<React.SetStateAction<SEOSettings>>;
  layoutSettings: LayoutSettings;
  setLayoutSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  activeComponent?: string; 
  onSaveCarousel: (
    carouselSpeed: number,
    updatedCarouselImages: CarouselImageType[]
  ) => void;
  carouselImages: CarouselImageType[]; 
  carouselSpeed: number; 
  page: Page | null;
}

const SidebarContainer = styled.div`
  width: 350px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  max-height: 100vh;
  border-right: 1px solid ${(props) => props.theme.colors.border};
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.sidebarBackground};
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding-bottom: 0.5rem;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${(props) =>
    props.isActive ? props.theme.colors.primary : 'transparent'};
  color: ${(props) =>
    props.isActive ? '#fff' : props.theme.colors.text};
  border: none;
  cursor: pointer;
  font-weight: ${(props) => (props.isActive ? 'bold' : 'normal')};
  border-bottom: ${(props) =>
    props.isActive ? `3px solid ${props.theme.colors.primary}` : 'none'};
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: ${(props) =>
      props.isActive
        ? props.theme.colors.primaryDark
        : props.theme.colors.hoverBackground};
  }

  &:focus {
    outline: 2px solid ${(props) => props.theme.colors.primaryDark};
  }
`;

const SectionContainer = styled.div`
  margin-top: 1rem;

  & > label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  & > input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 4px;
    box-sizing: border-box;
  }

  & > h4 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  & > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({
  seoSettings,
  setSEOSettings,
  layoutSettings,
  setLayoutSettings,
  activeComponent,
  onSaveCarousel,
  carouselImages,
  carouselSpeed,
  page
}) => {
  const [activeTab, setActiveTab] = React.useState<'page' | 'carousel'>('page');

  useEffect(() => {
    if (activeComponent === 'carousel') {
      setActiveTab('carousel');
    }
  }, [activeComponent]);

  return (
    <SidebarContainer>
      <Tabs>
        <TabButton
          isActive={activeTab === 'page'}
          onClick={() => setActiveTab('page')}
          aria-selected={activeTab === 'page'}
          role="tab"
        >
          Page
        </TabButton>
        <TabButton
          isActive={activeTab === 'carousel'}
          onClick={() => setActiveTab('carousel')}
          aria-selected={activeTab === 'carousel'}
          role="tab"
        >
          Carousel
        </TabButton>
      </Tabs>

      {activeTab === 'page' ? (
        <SectionContainer>
          <h3>Page Settings</h3>
          <label htmlFor="pageTitle">Page Title</label>
          <input
            id="pageTitle"
            type="text"
            placeholder="Enter Page Title"
            value={seoSettings.title || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSEOSettings({ ...seoSettings, title: e.target.value })
            }
          />
          <label htmlFor="pageSlug">Slug</label>
          <input
            id="pageSlug"
            type="text"
            placeholder="Enter Page Slug"
          />

          <h4>Layout Settings</h4>
          <div>
            <Checkbox
              label="Show Header"
              checked={layoutSettings.header ?? false}
              onChange={(checked: boolean) =>
                setLayoutSettings({ ...layoutSettings, header: checked })
              }
            />
          </div>
        </SectionContainer>
      ) : activeTab === 'carousel' ? (
        <CarouselEdit
          carouselImages={carouselImages}
          carouselSpeed={carouselSpeed}
          onSaveCarousel={onSaveCarousel} 
        />
      ) : (
        <p>Select a component to edit</p>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;