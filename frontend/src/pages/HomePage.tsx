import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import HomePageHeader from '../components/landing/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPageBySlug } from '../api/pageApi';
import { Page } from '../api/types/page';
import { fetchWebsiteSettings } from '../api/utilsApi';
import DOMPurify from 'dompurify';
import ImageCarousel from '../components/common/ImageCarousel';
import AnnouncementSection from '../components/common/Announcement';
import { ImageCarouselSettings, WebsiteSettings } from '../api/types/core';
import ErrorComponent from "../components/common/Error";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDna, faRibbon, faSuitcaseMedical } from '@fortawesome/free-solid-svg-icons';

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
`;

const HeroSection = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rem 2rem;
  background: ${(props) => props.theme.colors.primaryLight};
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroText = styled.div`
  flex: 1;
  padding-right: 2rem;

  h1 {
    font-size: 3rem;
    color: ${(props) => props.theme.colors.primaryDark};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: ${(props) => props.theme.colors.text};
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const CTAButton = styled.button`
  background-color: ${(props) => props.theme.colors.accent};
  color: #fff;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
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

const IconSection = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1200px;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const IconBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  svg {
    font-size: 2rem;
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1rem;
    color: ${(props) => props.theme.colors.textMuted};
  }
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin-top: 2rem;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CarouselWrapper = styled.div`
  flex: 1;
  max-width: 50%;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AboutSection = styled.section`
  flex: 1;
  padding: 2rem;
  margin-left: 2rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 2rem;
  }
`;

const SectionIcon = styled(FontAwesomeIcon)`
  margin-right: 10px;
  color: ${(props) => props.theme.colors.primary};
`;

const HomePage: React.FC = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedPage, fetchedSettings] = await Promise.all([
          getPageBySlug('landing'),
          fetchWebsiteSettings(),
        ]);
        setPage(fetchedPage);
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!page) return <ErrorComponent message={"Content not found"} />;
  if (!settings) return <ErrorComponent message={"Error loading settings"} />;

  const sanitizedContent = DOMPurify.sanitize(page.content);
  const carouselImages = page.carousel || [];
  const announcements = page.announcements || [];

  const carouselSettings: ImageCarouselSettings = {
    autoplaySpeed: 8000,
  };

  return (
    <HomePageContainer>
        {/* Announcements */}
        {announcements && <AnnouncementSection title="Latest Announcements" announcements={announcements} />}

      {/* Hero Section */}
      <HeroSection>
        <HeroText>
          <h1>Discover Our Amazing French Bulldogs</h1>
          <p>Breeding top-notch quality, temperament, and beauty into every French Bulldog.</p>
          <CTAButton>Explore Our Services</CTAButton>
          <HomePageHeader
            title={page.name}
            lastUpdated={settings.updatedAt}
            introduction={page.customValues?.introductionText || "Welcome to Texas Top Notch Frenchies!"}
                />
        </HeroText>
        <HeroImage>
            {carouselImages && <ImageCarousel images={carouselImages} width={"300px"} settings={carouselSettings} />}
        </HeroImage>
      </HeroSection>

      {/* Icon Section */}
      <IconSection>
        <IconBox>
          <SectionIcon icon={faDna} />

          <p>High-Quality Breeding</p>
        </IconBox>
        <IconBox>
          <SectionIcon icon={faRibbon} />

          <p>Champion Bloodlines</p>
        </IconBox>
        <IconBox>
          <SectionIcon icon={faSuitcaseMedical} />
          <p>Exceptional Care</p>
        </IconBox>
      </IconSection>


      {/* Main Content */}
      <ContentContainer>
        <AboutSection dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </ContentContainer>
    </HomePageContainer>
  );
};

export default HomePage;