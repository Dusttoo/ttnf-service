import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import usePage from '../../../../../hooks/usePage';
import { updatePageContent } from '../../../../../store/pageSlice';
import { HeroContent } from '../../../../../api/types/page';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import PreviewMode from './PreviewMode';
import ToggleButton from './ToggleButton';
import styled from 'styled-components';
import LoadingSpinner from '../../../../common/LoadingSpinner';
import ErrorComponent from '../../../../common/Error';
import HeroEdit from './HeroEditor';
import CarouselEdit from './CarouselEditor';

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.background};
`;

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { page, loading, error, handleSave } = usePage(id);
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(true);
  const [content, setContent] = useState<string>('');
  const [seoSettings, setSEOSettings] = useState(page?.settings?.seo || {});
  const [layoutSettings, setLayoutSettings] = useState(
    page?.settings?.layout || {}
  );
  const [aboutContent, setAboutContent] = useState<string>(
    page?.customValues?.aboutContent || ''
  );
  console.log(page);
  useEffect(() => {
    if (page) {
      setContent(page.content);
      setSEOSettings(page.settings?.seo || {});
      setLayoutSettings(page.settings?.layout || {});
      setAboutContent(page.customValues?.aboutContent || '');
    }
  }, [page]);

  const handleSaveContent = () => {
    if (page) {
      const updatedPage = {
        ...page,
        customValues: {
          ...page.customValues,
          aboutContent,
        },
        content,
      };

      dispatch(updatePageContent({ pageId: page.id, content: updatedPage }));
      handleSave();
    }
  };

  const handleSaveHero = (updatedHeroContent: HeroContent) => {
    if (page) {
      const updatedPage = {
        ...page,
        customValues: {
          ...page.customValues,
          heroContent: updatedHeroContent, // Update hero content
        },
      };
      dispatch(updatePageContent({ pageId: page.id, content: updatedPage }));
      handleSave();
    }
  };

  const handleSaveCarousel = (updatedCarouselImages: CarouselImageType[]) => {
    if (page) {
      const updatedPage = {
        ...page,
        customValues: {
          ...page.customValues,
          carouselImages: updatedCarouselImages, // Update carousel images
        },
      };
      dispatch(updatePageContent({ pageId: page.id, content: updatedPage }));
      handleSave();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;
  if (!page) return <ErrorComponent message={'Could not find page.'} />;

  return (
    <EditorContainer>
      <ContentContainer>
        <ToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode((prevMode) => !prevMode)}
        />
        {isEditMode ? (
          <>
            {page.customValues?.heroContent && (
              <HeroEdit page={page} onSaveHero={handleSaveHero} />
            )}

            {page.carousel && (
              <CarouselEdit page={page} onSaveCarousel={handleSaveCarousel} />
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
          <button onClick={handleSaveContent} style={{ marginTop: '20px' }}>
            Save
          </button>
        )}
      </ContentContainer>
      <Sidebar
        seoSettings={seoSettings}
        setSEOSettings={setSEOSettings}
        layoutSettings={layoutSettings}
        setLayoutSettings={setLayoutSettings}
      />
    </EditorContainer>
  );
};

export default PageEditor;
