import React from 'react';
import styled from 'styled-components';
import { HeroContent, Page } from '../../api/types/page';
import CTAButton from '../common/CTAButton';
import ImageCarousel from '../common/ImageCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import WaitlistModal from '../waitlist/WaitlistModal';
import { CarouselImage as CarouselImageType } from '../../api/types/core';
import Input from '../common/Input';
import Textarea from '../common/TextArea';

const HeroContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4rem 2rem;
  background: ${(props) => props.theme.colors.neutralBackground};
  border-radius: 20px;

  @media (max-width: 768px) {
    text-align: center;
    align-items: center;
  }
`;

const HeaderContainer = styled.header`
  width: 100%;
  margin-bottom: 2rem;
  text-align: left;
`;

const LastUpdated = styled.p`
  color: ${(props) => props.theme.colors.textMuted};
  font-size: 14px;
`;

const Introduction = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const SocialMedia = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialMediaIcon = styled.a`
  font-size: 24px;
  color: ${(props) => props.theme.colors.primary};
  transition: color 0.3s ease;

  &:hover {
    color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const HeroContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeroText = styled.div`
  flex: 1;
  padding-right: 2rem;

  h1 {
    font-size: 3rem;
    color: ${(props) => props.theme.colors.white};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: ${(props) => props.theme.colors.text};
    margin-bottom: 2rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const HeroImage = styled.div`
  flex: 1;
  img {
    width: 100%;
    height: auto;
    border-radius: 20px;
  }
`;

interface HeroSectionProps {
  page?: Page;
  heroContent: HeroContent;
  title: string;
  lastUpdated: string | undefined;
  introduction: string;
  onChange?: (updatedHeroContent: HeroContent) => void;
  editMode?: boolean;
  previewMode?: boolean;
  onSaveCarousel?: (
    carouselSpeed: number,
    updatedCarouselImages: CarouselImageType[]
  ) => void;
  handleComponentClick?: (componentName: string) => void; // New prop for handling component click
}

const HeroSection: React.FC<HeroSectionProps> = ({
  heroContent,
  title,
  lastUpdated,
  introduction,
  onChange,
  editMode = false,
  previewMode = false,
  onSaveCarousel,
  page,
  handleComponentClick, // Added to props
}) => {
  const carouselSpeed = heroContent.carouselSpeed || 3000;

  const handleChange = (field: keyof HeroContent, value: string) => {
    if (onChange) {
      onChange({ ...heroContent, [field]: value });
    }
  };

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <HeroContainer>
      <HeroContentWrapper>
        <HeroText>
          {editMode && !previewMode ? (
            <Input
              type="text"
              value={heroContent.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter hero title"
              style={{
                fontSize: '3rem',
                color: 'white',
                marginBottom: '1rem',
                width: '100%',
              }}
            />
          ) : (
            <h1>{heroContent.title}</h1>
          )}

          {editMode && !previewMode ? (
            <Textarea
              value={heroContent.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter hero description"
            />
          ) : (
            <p>{heroContent.description}</p>
          )}

          <div className="cta-buttons">
            {editMode && !previewMode ? (
              <Input
                type="text"
                value={heroContent.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                placeholder="Enter CTA text"
                style={{
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  width: 'auto',
                }}
              />
            ) : (
              <CTAButton
                label={heroContent.ctaText}
                onClick={() => alert('CTA Button Clicked')}
              />
            )}
            <WaitlistModal />
          </div>
        </HeroText>

        <HeroImage>
          {heroContent.carouselImages.length > 0 && (
            <div style={{zIndex: 1000}} onClick={() => handleComponentClick?.('carousel')}> {/* Set carousel as active */}
              <ImageCarousel
                images={
                  page?.customValues?.heroContent
                    ? page.customValues.heroContent.carouselImages
                    : heroContent.carouselImages
                }
                width="300px"
                settings={{ autoplaySpeed: heroContent.carouselSpeed || 8000 }}
              />
            </div>
          )}
        </HeroImage>
      </HeroContentWrapper>
      <HeaderContainer>
        <LastUpdated>Last Updated: {formattedDate}</LastUpdated>
        <Introduction>{introduction}</Introduction>
        <SocialMedia>
          <SocialMediaIcon
            href="https://www.facebook.com/@texastopnotchfrenchies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFacebook} />
          </SocialMediaIcon>
          <SocialMediaIcon
            href="https://www.instagram.com/texas_top_notch_frenchies/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </SocialMediaIcon>
        </SocialMedia>
      </HeaderContainer>
    </HeroContainer>
  );
};

export default HeroSection;