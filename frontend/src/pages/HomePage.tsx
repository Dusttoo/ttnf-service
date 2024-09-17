import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import HomePageHeader from '../components/landing/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPageBySlug } from '../api/pageApi';
import { Page } from '../api/types/page';
import DOMPurify from 'dompurify';
import ImageCarousel from '../components/common/ImageCarousel'
import AnnouncementSection from '../components/common/Announcement'

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

    useEffect(() => {
        const fetchPage = async () => {
            const fetchedPage = await getPageBySlug('landing');
            setPage(fetchedPage);
        };
        fetchPage();
    }, []);

    if (!page) return <LoadingSpinner />;

    const sanitizedContent = DOMPurify.sanitize(page.content);

    const memes = [
        {
          id: 1,
          src: 'https://i0.wp.com/texastopnotchfrenchies.com/wp-content/uploads/2022/12/G0yapF7-1.jpeg?w=1073&ssl=1',
          alt: 'Meme 1',
        },
        {
          id: 2,
          src: 'https://i0.wp.com/texastopnotchfrenchies.com/wp-content/uploads/2022/12/320277169_920956245566116_7512405805898762110_n.jpeg?ssl=1',
          alt: 'Meme 2',
        }
      ];

    const announcements = [
      {
        id: 1,
        title: 'New Litter Available!',
        date: '2024-09-10',
        message: 'We are excited to announce a new litter of French Bulldogs! Contact us for more information.',
      },
      {
        id: 2,
        title: 'Upcoming Planned Breeding',
        date: '2024-08-30',
        message: 'We have an upcoming planned breeding in October. Stay tuned for details!',
      },
      {
        id: 3,
        title: 'New Stud Service Available',
        date: '2024-08-15',
        message: 'Our male, Thunder Cat, is now available for stud services! Contact us for more details.',
      },
    ];

    return (
        <HomePageContainer>
            <HomePageHeader
                title={page.name}
                lastUpdated={page.updatedAt}
                introduction={page.customValues?.introductionText || "Welcome to Texas Top Notch Frenchies!"}
            />

            <AnnouncementSection title="Latest Announcements" announcements={announcements} />
            <ImageCarousel images={memes} />

            <AboutSection dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </HomePageContainer>
    );
};

export default HomePage;