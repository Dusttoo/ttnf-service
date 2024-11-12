import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPageBySlug } from '../api/pageApi';
import { Page, HeroContent } from '../api/types/page';
import { fetchWebsiteSettings } from '../api/utilsApi';
import DOMPurify from 'dompurify';
import AnnouncementSection from '../components/common/Announcement';
import { WebsiteSettings } from '../api/types/core';
import ErrorComponent from '../components/common/Error';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDna,
  faRibbon,
  faSuitcaseMedical,
} from '@fortawesome/free-solid-svg-icons';
import HeroSection from '../components/blocks/HeroSection';

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
`;

const IconSection = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1200px;
  margin: 2rem 0;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1.5rem;
  border-radius: 10px;

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
    color: ${(props) => props.theme.colors.text};
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

const AboutSection = styled.section`
  flex: 1;
  padding: 2rem;
  margin-left: 2rem;
  background-color: ${(props) =>
    props.theme.colors.cardBackground}; // Darker card background
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 2rem;
  }

  h2 {
    color: ${(props) => props.theme.colors.white}; // Lightened for readability
  }

  p {
    color: ${(props) =>
      props.theme.colors
        .textSecondary}; // Use secondary text color for less emphasis
  }
`;

const SectionIcon = styled(FontAwesomeIcon)`
  margin-right: 10px;
  color: ${(props) => props.theme.colors.primary};
`;

const HomePage: React.FC = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
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
        setHeroContent(
          fetchedPage?.customValues?.heroContent || {
            title: 'Welcome!',
            description:
              'Breeding top-notch quality, temperament, and beauty into every French Bulldog.',
            ctaText: 'Explore our services',
            introductionText: 'Healthy bulldogs',
            carouselSpeed: 8000,
            carouselImages: [],
          }
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!page) return <ErrorComponent message={'Content not found'} />;
  if (!settings) return <ErrorComponent message={'Error loading settings'} />;

  const sanitizedContent = DOMPurify.sanitize(page.content);
  const announcements = page.announcements || [];

  return (
    <HomePageContainer>
      {/* Announcements */}
      {announcements.length > 0 && (
        <AnnouncementSection
          title="Latest Announcements"
          announcements={announcements}
        />
      )}

      {/* Hero Section */}
      {heroContent && (
        <HeroSection
        heroContent={heroContent}
        title={page.name}
        lastUpdated={settings.updatedAt}
        introduction={page.customValues?.introductionText || 'Welcome!'}
        previewMode={true}
      />
      )}
      {/* Icon Section */}
      <IconSection>
        <IconBox>
          <SectionIcon icon={faDna} />
          <p>High-Quality Breeding</p>
        </IconBox>
        <IconBox>
          <SectionIcon icon={faRibbon} />
          <p>Excellent Temperament</p>
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

      {/* Waitlist Modal */}
    </HomePageContainer>
  );
};

export default HomePage;
