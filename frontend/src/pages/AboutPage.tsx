import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import usePage from "../hooks/usePage";
import DOMPurify from 'dompurify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorComponent from "../components/common/Error";


const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.neutralBackground};
`;

const SectionHeader = styled.h1`
  font-size: 2.5rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const AboutContent = styled.div`
  font-size: 1.2rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  text-align: justify;
  margin-top: 2rem;
`;

const ImageContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const AboutImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const AboutPage: React.FC<{ slug?: string }> = ({ slug }) => {
    const { page, loading, error } = usePage(slug);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorComponent message={error} />;
    if (!page) return <ErrorComponent message={"Content not found"} />

    const sanitizedContent = DOMPurify.sanitize(page.content);

    return (
        <AboutContainer>
            <SectionHeader>About Us</SectionHeader>
            <AboutContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </AboutContainer>
    );
};

export default AboutPage;