import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SEOSettings, LayoutSettings } from '../../../../../api/types/page';
import Checkbox from '../../../../common/form/Checkbox';
import CarouselEdit from './CarouselEditor';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';

interface SidebarProps {
  seoSettings: SEOSettings;
  setSEOSettings: React.Dispatch<React.SetStateAction<SEOSettings>>;
  layoutSettings: LayoutSettings;
  setLayoutSettings: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  activeComponent?: string; // Identify the clicked component (e.g., "carousel" for ImageCarousel)
  onSaveCarousel?: (
    carouselSpeed: number,
    updatedCarouselImages: CarouselImageType[]
  ) => void;
  carouselImages?: CarouselImageType[];
  carouselSpeed?: number;
}

const SidebarContainer = styled.div`
  width: 350px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: scroll;
  max-height: 100%;
  border-right: 1px solid ${(props) => props.theme.colors.border};
  box-sizing: border-box;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.5rem;
  background: ${(props) =>
    props.isActive ? props.theme.colors.primary : 'none'};
  color: ${(props) => (props.isActive ? '#fff' : props.theme.colors.text)};
  border: none;
  cursor: pointer;
  font-weight: bold;
`;

const SectionContainer = styled.div`
  margin-bottom: 1rem;
`;

const Sidebar: React.FC<SidebarProps> = ({
  seoSettings,
  setSEOSettings,
  layoutSettings,
  setLayoutSettings,
  activeComponent,
  onSaveCarousel,
  carouselImages = [],
  carouselSpeed = 3000,
}) => {
  const [activeTab, setActiveTab] = useState<'page' | 'block'>('page');
  const [localCarouselImages, setLocalCarouselImages] = useState<CarouselImageType[]>(carouselImages);
  const [localCarouselSpeed, setLocalCarouselSpeed] = useState<number>(carouselSpeed);

  useEffect(() => {
    setLocalCarouselImages(carouselImages);
    setLocalCarouselSpeed(carouselSpeed);
  }, [carouselImages, carouselSpeed]);

  useEffect(() => {
    if (activeComponent === 'carousel') {
      setActiveTab('block');
    }
  }, [activeComponent]);

  // Handle changes from CarouselEdit
  const handleCarouselChange = (updatedSpeed: number, updatedImages: CarouselImageType[]) => {
    setLocalCarouselImages(updatedImages);
    setLocalCarouselSpeed(updatedSpeed);
    onSaveCarousel?.(updatedSpeed, updatedImages); // Ensure that updates are saved here
  };

  return (
    <SidebarContainer>
      <Tabs>
        <TabButton
          isActive={activeTab === 'page'}
          onClick={() => setActiveTab('page')}
        >
          Page
        </TabButton>
        <TabButton
          isActive={activeTab === 'block'}
          onClick={() => setActiveTab('block')}
        >
          Block
        </TabButton>
      </Tabs>

      {activeTab === 'page' ? (
        <SectionContainer>
          <h3>Page Settings</h3>
          <label>Page Title</label>
          <input type="text" placeholder="Enter Page Title" />
          <label>Slug</label>
          <input type="text" placeholder="Enter Page Slug" />

          <h4>SEO Settings</h4>
          <label>SEO Title</label>
          <input
            type="text"
            placeholder="Enter SEO Title"
            value={seoSettings.title}
            onChange={(e) =>
              setSEOSettings({ ...seoSettings, title: e.target.value })
            }
          />

          <h4>Layout Settings</h4>
          <Checkbox
            label="Show Header"
            checked={layoutSettings.header ?? false}
            onChange={(checked) =>
              setLayoutSettings({ ...layoutSettings, header: checked })
            }
          />
        </SectionContainer>
      ) : activeComponent === 'carousel' && onSaveCarousel ? (
        <CarouselEdit
          carouselImages={localCarouselImages}
          carouselSpeed={localCarouselSpeed}
          onSaveCarousel={handleCarouselChange} // Pass handler to capture changes
        />
      ) : (
        <p>Select a component to edit</p>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;