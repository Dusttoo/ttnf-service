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


const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const AboutSection = styled.section`
  width: 100%;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Footer = styled.footer`
  width: 100%;
  background-color: ${(props) => props.theme.colors.footerBackground};
  padding: 1rem;
  text-align: center;
  color: ${(props) => props.theme.colors.textMuted};
`;

const HomePage: React.FC = () => {
    const [page, setPage] = useState<Page | null>(null);
    const [settings, setSettings] = useState<WebsiteSettings | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('fetching')
                const [fetchedPage, fetchedSettings] = await Promise.all([
                    getPageBySlug('landing'),
                    fetchWebsiteSettings()
                ]);
                console.log(fetchedPage, fetchedSettings)
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
    if (!page) return <ErrorComponent message={"Content not found"} />
    if (!settings) return <ErrorComponent message={"Error loading settings"} />

    const sanitizedContent = DOMPurify.sanitize(page.content);

    const carouselImages = page.carousel || [];
    const announcements = page.announcements || [];

    const carouselSettings: ImageCarouselSettings = {
        autoplaySpeed: 8000,
    };

    return (
        <HomePageContainer>
            <HomePageHeader
                title={page.name}
                lastUpdated={settings.updatedAt}
                introduction={page.customValues?.introductionText || "Welcome to Texas Top Notch Frenchies!"}
            />

            {announcements && <AnnouncementSection title="Latest Announcements" announcements={announcements} />}
            {carouselImages && <ImageCarousel images={carouselImages} width={"50%"} settings={carouselSettings} />}

            <AboutSection dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </HomePageContainer>
    );
};

export default HomePage;