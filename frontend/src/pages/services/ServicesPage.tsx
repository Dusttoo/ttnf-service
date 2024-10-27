import React from 'react';
import ServicesList from '../../components/services/ServiceList';
import styled from 'styled-components';

const PageContainer = styled.div`
  background-color: ${(props) => props.theme.colors.secondary};
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;  /* Center the content and allow it to expand */
  margin: auto;
`;


const IntroductionSection = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.primary};
  font-family: ${(props) => props.theme.fonts.secondary};
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.textSecondary};
  max-width: 800px;
  margin: 0 auto;
`;

const ServicesPage: React.FC = () => {
    return (
        <PageContainer>
            <IntroductionSection>
                <Title>Our Services</Title>
                <Tagline>Comprehensive care tailored for your pets' needs</Tagline>
                <Description>
                    At Texas Top Notch Frenchies, we provide a range of services including
                    reproductive health, vaccinations, microchipping, and nutrition.
                    Explore our offerings below to find the best solutions for your pet.
                </Description>
            </IntroductionSection>
            <ServicesList />
        </PageContainer>
    );
};

export default ServicesPage;