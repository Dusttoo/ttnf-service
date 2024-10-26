import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useServices } from '../../hooks/useService';
import ServiceCard from './ServiceCard';
import Accordion from '../common/Accordion';

const ServicesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ServicesSection = styled.div`
  flex: 1;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-height: 100%;
  overflow: visible;
`;

const ServiceListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
`;

const ServicesList: React.FC = () => {
  const { data: services, isLoading, error } = useServices();

  if (isLoading) return <p>Loading services...</p>;
  if (error) return <p>Error loading services.</p>;

  const groupedServices = services?.reduce(
    (acc: Record<string, typeof services>, service) => {
      const category = service.category?.name || 'Uncategorized';
      acc[category] = acc[category] ? [...acc[category], service] : [service];
      return acc;
    },
    {}
  );

  const categories = Object.keys(groupedServices || {});

  return (
    <ServicesWrapper>
      <ServicesSection>
        {groupedServices &&
          categories.map((category, index) => (
            <div key={category} id={category}>
              {/* Open the first accordion by default */}
              <Accordion title={category} defaultOpen={index === 0}>
                <ServiceListContainer>
                  {groupedServices[category].map((service) => (
                    <ServiceCard
                      key={service.id}
                      name={service.name}
                      description={service.description}
                      price={service.price || ''}
                      availability={service.availability}
                      ctaName={service.cta_name || 'Learn More'}
                      ctaLink={service.cta_link || '#'}
                      disclaimer={service.disclaimer}
                    />
                  ))}
                </ServiceListContainer>
              </Accordion>
            </div>
          ))}
      </ServicesSection>
    </ServicesWrapper>
  );
};

export default ServicesList;
