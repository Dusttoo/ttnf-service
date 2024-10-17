import React from 'react';
import styled from 'styled-components';

interface ServiceAvailabilityProps {
  available: boolean;
}

const CardContainer = styled.div`
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: left;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceTitle = styled.h3`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.primary};
`;

const ServiceDescription = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.secondary};
  margin: 0.5rem 0;
`;

const ServicePrice = styled.p`
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
`;

const ServiceAvailability = styled.p<ServiceAvailabilityProps>`
  font-size: 0.9rem;
  color: ${(props) => (props.available ? props.theme.colors.secondary : props.theme.colors.error)};
`;

const CTAButton = styled.a`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
  }
`;

const Disclaimer = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.secondary};
  margin-top: 1rem;
  font-style: italic;
`;

interface ServiceCardProps {
  name: string;
  description: string;
  price: string;
  availability: string;
  ctaName: string;
  ctaLink: string;
  disclaimer?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ name, description, price, availability, ctaName, ctaLink, disclaimer }) => {
  return (
    <CardContainer>
      <ServiceTitle>{name}</ServiceTitle>
      <ServiceDescription>{description}</ServiceDescription>
      <ServicePrice>{price}</ServicePrice>
      <ServiceAvailability available={availability === 'Available'}>
        {availability}
      </ServiceAvailability>
      <CTAButton href={ctaLink}>{ctaName}</CTAButton>
      {disclaimer && <Disclaimer>{disclaimer}</Disclaimer>}
    </CardContainer>
  );
};

export default ServiceCard;