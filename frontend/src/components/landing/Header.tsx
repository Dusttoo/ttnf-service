import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const HeaderContainer = styled.header`
  text-align: left;
  margin-bottom: 2rem;
`;

const LastUpdated = styled.p`
  color: ${(props) => props.theme.colors.textMuted};
  font-size: 14px;
`;

const Introduction = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 2rem;
`;

const SocialMedia = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialMediaIcon = styled.a`
  font-size: 24px;
  color: ${(props) => props.theme.colors.primary};
  transition: color 0.3s ease;

  &:hover {
    color: ${(props) => props.theme.colors.primaryDark};
  }
`;

interface HomePageHeaderProps {
    title: string;
    lastUpdated: string | undefined;
    introduction: string;
}

const HomePageHeader: React.FC<HomePageHeaderProps> = ({ title, lastUpdated, introduction }) => {
    const formattedDate = lastUpdated
        ? new Date(lastUpdated).toString() !== 'Invalid Date'
            ? new Date(lastUpdated).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'Invalid Date'
        : 'N/A';

    return (
        <HeaderContainer>
            {/*<h1>{title}</h1>*/}
            <LastUpdated>Last Updated: {formattedDate}</LastUpdated>
            {/*<Introduction>{introduction}</Introduction>*/}

            <SocialMedia>
                <SocialMediaIcon href="https://www.facebook.com/@texastopnotchfrenchies" target="_blank"
                                 rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFacebook} />
                </SocialMediaIcon>
                <SocialMediaIcon href="https://www.instagram.com/texas_top_notch_frenchies/" target="_blank"
                                 rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faInstagram} />
                </SocialMediaIcon>
                {/*<SocialMediaIcon href="https://twitter.com" target="_blank" rel="noopener noreferrer">*/}
                {/*    <FontAwesomeIcon icon={faTwitter} />*/}
                {/*</SocialMediaIcon>*/}
            </SocialMedia>
        </HeaderContainer>
    );
};

export default HomePageHeader;