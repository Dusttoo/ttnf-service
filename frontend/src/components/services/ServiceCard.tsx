import React from 'react';
import styled from 'styled-components';

interface ServiceAvailabilityProps {
  available: boolean;
}

const CardContainer = styled.div`
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2); /* Stronger shadow for depth */
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  }
`;

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 0.75rem;
`;

const ServiceDescription = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0.5rem 0 1rem;
`;

const ServicePrice = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
  margin: 0.5rem 0;
`;

const ServiceAvailability = styled.p<ServiceAvailabilityProps>`
  font-size: 1rem;
  color: ${(props) =>
    props.available ? props.theme.colors.primary : props.theme.colors.error};
  margin: 0.5rem 0;
`;

const CTAButton = styled.a`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 0.6rem 1.2rem;
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
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
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

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  description,
  price,
  availability,
  ctaName,
  ctaLink,
  disclaimer,
}) => {
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