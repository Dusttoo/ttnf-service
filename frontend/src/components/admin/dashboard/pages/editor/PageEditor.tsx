import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import usePage from '../../../../../hooks/usePage';
import { HeroContent } from '../../../../../api/types/page';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import PreviewMode from './PreviewMode';
import LoadingSpinner from '../../../../common/LoadingSpinner';
import ErrorComponent from '../../../../common/Error';
import SuccessMessage from '../../../../common/SuccessMessage';
import HeroSection from '../../../../blocks/HeroSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../../../../context/ModalContext';
import { fetchWebsiteSettings } from '../../../../../api/utilsApi';
import Toolbar from './EditorToolbar';

const LEFT_SIDEBAR_WIDTH = 150;
const RIGHT_SIDEBAR_OPEN_WIDTH = 350;
const DEBOUNCE_DELAY = 60000; // 60 seconds
const TOOLBAR_HEIGHT = 60;

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-top: ${TOOLBAR_HEIGHT}px;
`;

const ContentContainer = styled.div<{ isSidebarOpen: boolean }>`
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.background};
  flex-grow: 1;
  transition: margin-right 0.3s ease;
  margin-left: ${LEFT_SIDEBAR_WIDTH}px;
  margin-right: ${(props) =>
    props.isSidebarOpen ? `${RIGHT_SIDEBAR_OPEN_WIDTH}px` : '0'};
  overflow: auto;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-left: 0;
    margin-right: 0;
  }
`;

const SidebarContainer = styled.div<{ isSidebarOpen: boolean }>`
  width: ${(props) =>
    props.isSidebarOpen ? `${RIGHT_SIDEBAR_OPEN_WIDTH}px` : '0'};
  transition: width 0.3s ease;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: ${TOOLBAR_HEIGHT}px;
  height: calc(100vh - ${TOOLBAR_HEIGHT}px);
  background-color: ${(props) => props.theme.colors.sidebarBackground};
  border-left: 1px solid ${(props) => props.theme.colors.border};
`;

const ToggleButton = styled.button<{ isSidebarOpen: boolean }>`
  position: fixed;
  right: ${(props) =>
    props.isSidebarOpen ? `${RIGHT_SIDEBAR_OPEN_WIDTH}px` : '0'};
  top: 50%;
  transform: translateY(-50%);
  background-color: ${(props) => props.theme.colors.primary};
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  z-index: 1000;
  transition: right 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { page, loading, error, handleSave } = usePage(id);
  const { openModal } = useModal();
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [content, setContent] = useState<string>('');
  const [seoSettings, setSEOSettings] = useState(page?.settings?.seo || {});
  const [layoutSettings, setLayoutSettings] = useState(
    page?.settings?.layout || {}
  );
  const [aboutContent, setAboutContent] = useState<string>(
    page?.customValues?.aboutContent || ''
  );
  const [heroContent, setHeroContent] = useState<HeroContent | null>(
    page?.customValues?.heroContent || null
  );
  const [standaloneCarouselImages, setStandaloneCarouselImages] = useState<
    CarouselImageType[]
  >(page?.carousel || page?.customValues?.heroContent?.carouselImages || []);
  const [carouselSpeed, setCarouselSpeed] = useState<number>(
    page?.customValues?.heroContent?.carouselSpeed || 5000
  );
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [activeComponent, setActiveComponent] = useState<string | undefined>(
    undefined
  );
  const [hasChanges, setHasChanges] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Sync with page data
  useEffect(() => {
    if (page) {
      setContent(page.content);
      setSEOSettings(page.settings?.seo || {});
      setLayoutSettings(page.settings?.layout || {});
      setAboutContent(page.customValues?.aboutContent || '');
      setHeroContent(page.customValues?.heroContent || null);
      setStandaloneCarouselImages(
        page.carousel || page.customValues?.heroContent?.carouselImages || []
      );
    }
  }, [page]);

  // Fetch last updated settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await fetchWebsiteSettings();
        setLastUpdated(settings.updatedAt);
      } catch (error) {
        console.error('Error fetching website settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const togglePreviewMode = () => {
    setPreviewMode((prev) => !prev);
  };

  // Handle debounced content save
  const handleContentChange = () => {
    setHasChanges(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      saveChanges();
    }, DEBOUNCE_DELAY);
  };

  const saveChanges = useCallback(() => {
    if (page) {
      const updatedPage = {
        ...page,
        content,
        customValues: {
          ...page.customValues,
          aboutContent,
          heroContent: {
            ...heroContent,
            carouselImages: standaloneCarouselImages,
            carouselSpeed,
          },
        },
      };

      handleSave(updatedPage);
      setHasChanges(false);
      openModal(<SuccessMessage message="Page saved successfully!" />);
    }
  }, [
    page,
    content,
    aboutContent,
    heroContent,
    standaloneCarouselImages,
    carouselSpeed,
    handleSave,
    openModal,
  ]);

  // Manual save handler
  const manualSave = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Clear debounce on manual save
    }
    if (hasChanges) {
      handleSaveContent();
    }
  };

  // Handle active component click
  const handleComponentClick = (componentName: string) => {
    setActiveComponent(componentName);
    if (!isSidebarOpen) {
      handleToggleSidebar();
    }
  };

  const handleSaveContent = () => {
    if (page) {
      const updatedPage = {
        ...page,
        customValues: {
          ...page.customValues,
          aboutContent,
          heroContent: {
            ...heroContent,
            carouselImages: standaloneCarouselImages,
            carouselSpeed: carouselSpeed,
          },
        },
        content,
      };

      handleSave(updatedPage);
      openModal(<SuccessMessage message="Page saved successfully!" />);
      setHasChanges(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    setTimeout(() => {
      const event = new Event('resize');
      window.dispatchEvent(event);
    }, 300);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;
  if (!page) return <ErrorComponent message="Could not find page." />;

  return (
    <EditorContainer>
      <Toolbar
        lastSaved={lastUpdated || 'Never'}
        isSaveActive={hasChanges}
        onSave={handleSaveContent}
        previewMode={previewMode}
        togglePreviewMode={togglePreviewMode}
      />

      <ContentContainer isSidebarOpen={isSidebarOpen}>
        {isEditMode ? (
          <>
            {heroContent && (
                <HeroSection
                  page={page}
                  heroContent={heroContent}
                  title={page.name}
                  introduction={page.customValues?.introductionText || ''}
                  lastUpdated={lastUpdated}
                  onChange={(updatedHeroContent) => {
                    setHeroContent(updatedHeroContent);
                    setHasChanges(true);
                    handleContentChange()
                  }}
                  editMode={true}
                  onSaveCarousel={(
                    carouselSpeed: number,
                    updatedCarouselImages: CarouselImageType[]
                  ) => {
                    setHeroContent({
                      ...heroContent,
                      carouselImages: updatedCarouselImages,
                      carouselSpeed,
                    });
                    setHasChanges(true);
                    handleContentChange();
                  }}
                  handleComponentClick={handleComponentClick}
                  previewMode={previewMode}
                />
            )}
            {page.customValues?.aboutContent && (
              <div onClick={() => handleComponentClick('about')}>
                <ContentArea
                  content={aboutContent}
                  setContent={(newContent) => {
                    setAboutContent(newContent);
                    setHasChanges(true);
                    handleContentChange();
                  }}
                  height={300}
                  toolbarOptions="bold italic | bullist numlist"
                  placeholder="Enter content for the About section..."
                />
              </div>
            )}
            <div onClick={() => handleComponentClick('content')}>
              <ContentArea
                content={content}
                setContent={(newContent) => {
                  setContent(newContent);
                  setHasChanges(true);
                  handleContentChange();

                }}
              />
            </div>
          </>
        ) : (
          <PreviewMode content={content} />
        )}
      </ContentContainer>

      <SidebarContainer isSidebarOpen={isSidebarOpen}>
        <Sidebar
          seoSettings={seoSettings}
          setSEOSettings={setSEOSettings}
          layoutSettings={layoutSettings}
          setLayoutSettings={setLayoutSettings}
          carouselImages={standaloneCarouselImages}
          carouselSpeed={carouselSpeed}
          onSaveCarousel={(carouselSpeed, updatedCarouselImages) => {
            setStandaloneCarouselImages(updatedCarouselImages);
            setCarouselSpeed(carouselSpeed);
            setHasChanges(true);
          }}
          activeComponent={activeComponent}
        />
      </SidebarContainer>

      <ToggleButton isSidebarOpen={isSidebarOpen} onClick={handleToggleSidebar}>
        <FontAwesomeIcon
          icon={isSidebarOpen ? faChevronRight : faChevronLeft}
        />
      </ToggleButton>
    </EditorContainer>
  );
};

export default PageEditor;