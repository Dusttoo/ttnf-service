import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import usePage from '../../../../../hooks/usePage';
import { AppDispatch } from '../../../../../store';
import { updateExistingPage } from '../../../../../store/pageSlice';
import { HeroContent } from '../../../../../api/types/page';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import PreviewMode from './PreviewMode';
import styled from 'styled-components';
import LoadingSpinner from '../../../../common/LoadingSpinner';
import ErrorComponent from '../../../../common/Error';
import SuccessMessage from '../../../../common/SuccessMessage';
import HeroEdit from './HeroEditor';
import CarouselEdit from './CarouselEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../../../../context/ModalContext';

const LEFT_SIDEBAR_WIDTH = 150;
const RIGHT_SIDEBAR_OPEN_WIDTH = 300;
const RIGHT_SIDEBAR_CLOSED_WIDTH = 0;

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
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
  top: 0;
  height: 100vh;
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

const SaveButton = styled.button`
  margin-top: 20px;
`;

const PageEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { page, loading, error, handleSave } = usePage(id);
    const dispatch: AppDispatch = useDispatch();
    const { openModal, closeModal } = useModal();
    const [isEditMode, setIsEditMode] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [content, setContent] = useState<string>('');
    const [seoSettings, setSEOSettings] = useState(page?.settings?.seo || {});
    const [layoutSettings, setLayoutSettings] = useState(
        page?.settings?.layout || {},
    );
    const [aboutContent, setAboutContent] = useState<string>(
        page?.customValues?.aboutContent || '',
    );
    const [heroCarouselImages, setHeroCarouselImages] = useState<
        CarouselImageType[]
    >(page?.customValues?.heroContent?.carouselImages || []);
    const [standaloneCarouselImages, setStandaloneCarouselImages] = useState<
        CarouselImageType[]
    >(page?.carousel || []);
    const [carouselSpeed, setCarouselSpeed] = useState<number>(page?.customValues?.heroContent?.carouselSpeed || 5000);

    useEffect(() => {
        if (page) {
            setContent(page.content);
            setSEOSettings(page.settings?.seo || {});
            setLayoutSettings(page.settings?.layout || {});
            setAboutContent(page.customValues?.aboutContent || '');
            setHeroCarouselImages(page.customValues?.heroContent?.carouselImages || []);
            setStandaloneCarouselImages(page.carousel || []);
        }
    }, [page]);

    const handleSaveContent = () => {
        if (page) {
            const updatedPage = {
                ...page,
                customValues: {
                    ...page.customValues,
                    aboutContent,
                    heroContent: {
                        ...page.customValues?.heroContent,
                        carouselImages: heroCarouselImages,
                        carouselSpeed: carouselSpeed,
                        title: page.customValues?.heroContent?.title || '',
                        description: page.customValues?.heroContent?.description || '',
                        ctaText: page.customValues?.heroContent?.ctaText || '',
                        introductionText: page.customValues?.heroContent?.introductionText || '',
                    },
                },
                content,
                carousel: standaloneCarouselImages,
            };

            handleSave(updatedPage);
            openModal(<SuccessMessage message="Page saved successfully!" />);
        }
    };

    const handleSaveHeroCarousel = (updatedHeroContent: HeroContent) => {
        if (page) {
            const updatedPage = {
                ...page,
                customValues: {
                    ...page.customValues,
                    heroContent: {
                        ...updatedHeroContent,
                        title: updatedHeroContent.title || '',
                        description: updatedHeroContent.description || '',
                        ctaText: updatedHeroContent.ctaText || '',
                        introductionText: updatedHeroContent.introductionText || '',
                    },
                },
            };

            handleSave(updatedPage);
            openModal(<SuccessMessage message="Hero carousel updated successfully!" />);
        }
    };

    const handleSaveStandaloneCarousel = (
        carouselSpeed: number,
        updatedCarouselImages: CarouselImageType[],
    ) => {
        setStandaloneCarouselImages(updatedCarouselImages);
        setCarouselSpeed(carouselSpeed);
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
    if (!page) return <ErrorComponent message={'Could not find page.'} />;

    return (
        <EditorContainer>
            <ContentContainer isSidebarOpen={isSidebarOpen}>
                {isEditMode ? (
                    <>
                        {page.customValues?.heroContent && (
                            <HeroEdit
                                page={page}
                                onSaveHero={handleSaveHeroCarousel}
                                isSidebarOpen={isSidebarOpen}
                            />
                        )}

                        {page.carousel && !page.customValues?.heroContent && (
                            <CarouselEdit
                                page={page}
                                onSaveCarousel={handleSaveStandaloneCarousel}
                                isInsideParent={false}
                                isSidebarOpen={isSidebarOpen}
                            />
                        )}

                        {page.customValues?.aboutContent && (
                            <ContentArea
                                content={aboutContent}
                                setContent={setAboutContent}
                                height={300}
                                toolbarOptions="bold italic | bullist numlist"
                                placeholder="Enter content for the About section..."
                            />
                        )}

                        <ContentArea content={content} setContent={setContent} />
                    </>
                ) : (
                    <PreviewMode content={content} />
                )}
                {isEditMode && (
                    <SaveButton onClick={handleSaveContent}>Save</SaveButton>
                )}
            </ContentContainer>

            <SidebarContainer isSidebarOpen={isSidebarOpen}>
                <Sidebar
                    seoSettings={seoSettings}
                    setSEOSettings={setSEOSettings}
                    layoutSettings={layoutSettings}
                    setLayoutSettings={setLayoutSettings}
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