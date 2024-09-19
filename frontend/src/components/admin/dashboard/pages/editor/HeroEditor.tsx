import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../../../common/Button';
import ImageCarousel from '../../../../common/ImageCarousel';
import { Page, HeroContent } from '../../../../../api/types/page';
import CarouselEdit from './CarouselEditor';

const HeroEditContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
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
      setHeroContent(page.customValues.heroContent); // Load existing hero content from the page
    }
  }, [page]);

  // Handle saving the entire hero section including carousel
  const handleSaveHero = () => {
    onSaveHero({
      title: heroContent.title,
      description: heroContent.description,
      ctaText: heroContent.ctaText,
      introductionText: heroContent.introductionText,
      carouselImages: heroContent.carouselImages,
    });
  };

  // Handle saving the carousel images from the CarouselEdit component
  const handleSaveCarousel = (
    updatedCarouselImages: HeroContent['carouselImages']
  ) => {
    setHeroContent({ ...heroContent, carouselImages: updatedCarouselImages });
  };

  return (
    <HeroEditContainer>
      <h3>Edit Hero Section</h3>

      <label>Title</label>
      <InputField
        type="text"
        value={heroContent.title}
        onChange={(e) =>
          setHeroContent({ ...heroContent, title: e.target.value })
        }
        placeholder="Enter hero title"
      />

      <label>Description</label>
      <TextArea
        value={heroContent.description}
        onChange={(e) =>
          setHeroContent({ ...heroContent, description: e.target.value })
        }
        placeholder="Enter hero description"
      />

      <label>Call-to-Action Text</label>
      <InputField
        type="text"
        value={heroContent.ctaText}
        onChange={(e) =>
          setHeroContent({ ...heroContent, ctaText: e.target.value })
        }
        placeholder="Enter CTA text"
      />

      <label>Introduction Text</label>
      <TextArea
        value={heroContent.introductionText}
        onChange={(e) =>
          setHeroContent({ ...heroContent, introductionText: e.target.value })
        }
        placeholder="Enter introduction text"
      />

      <label>Hero Carousel</label>
      <ImageCarousel
        images={heroContent.carouselImages}
        width="300px"
        settings={{ autoplay: true }}
      />

      {/* Pass handleSaveCarousel to CarouselEdit */}
      <CarouselEdit page={page} onSaveCarousel={handleSaveCarousel} />

      <CTAButton variant="primary" onClick={handleSaveHero}>
        Save Hero Section
      </CTAButton>
    </HeroEditContainer>
  );
};

export default HeroEdit;
