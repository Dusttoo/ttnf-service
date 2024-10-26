import React from 'react';
import ServicesList from '../../components/services/ServiceList';
import styled from 'styled-components';

const IntroductionSection = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.primary};
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.secondary};
`;

const ServicesPage: React.FC = () => {
  return (
    <div>
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
    </div>
  );
};

export default ServicesPage;
