import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../../../common/Button';
import { Page, HeroContent } from '../../../../../api/types/page';
import CarouselEdit from './CarouselEditor';
import Input from '../../../../common/Input';
import Textarea from '../../../../common/TextArea';

const HeroEditContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`;

const CTAButton = styled(Button)`
  margin-top: 1rem;
`;

interface HeroEditProps {
  page: Page;
  onSaveHero: (updatedHeroContent: HeroContent) => void;
}

const HeroEdit: React.FC<HeroEditProps> = ({ page, onSaveHero }) => {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: '',
    description: '',
    ctaText: '',
    introductionText: '',
    carouselImages: [],
  });

  useEffect(() => {
    if (page.customValues?.heroContent) {
      setHeroContent(page.customValues.heroContent);
    }
  }, [page]);

  const handleSaveHero = () => {
    onSaveHero({
      ...heroContent,
      carouselImages: heroContent.carouselImages,
    });
  };

  const handleUpdateCarousel = (
    updatedCarouselImages: HeroContent['carouselImages']
  ) => {
    setHeroContent((prevState) => ({
      ...prevState,
      carouselImages: updatedCarouselImages,
    }));
  };

  return (
    <HeroEditContainer>
      <h3>Edit Hero Section</h3>

      <Input
        type="text"
        value={heroContent.title}
        onChange={(e) =>
          setHeroContent({ ...heroContent, title: e.target.value })
        }
        label="Title"
        placeholder="Enter hero title"
      />

      <Textarea
        value={heroContent.description}
        onChange={(e) =>
          setHeroContent({ ...heroContent, description: e.target.value })
        }
        label="Description"
        placeholder="Enter hero description"
      />

      <Input
        type="text"
        value={heroContent.ctaText}
        onChange={(e) =>
          setHeroContent({ ...heroContent, ctaText: e.target.value })
        }
        label="Call-to-Action Text"
        placeholder="Enter CTA text"
      />

      <CarouselEdit
        page={page}
        onSaveCarousel={handleUpdateCarousel}
        isInsideParent
      />

      <CTAButton variant="primary" onClick={handleSaveHero}>
        Save Hero Section
      </CTAButton>
    </HeroEditContainer>
  );
};

export default HeroEdit;
