import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useServices } from '../../hooks/useService';
import ServiceCard from './ServiceCard';

const ServiceListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
`;

const CategoryHeader = styled.h2`
  font-family: ${(props) => props.theme.fonts.secondary};
  color: ${(props) => props.theme.colors.secondary};
  text-align: center;
  margin: 2rem 0;
`;

interface ServicesListProps {
    page: number;
    pageSize: number;
    onTotalItemsChange: (total: number) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ page, pageSize, onTotalItemsChange }) => {
    const { data: services, isLoading, error } = useServices(page, pageSize);

    useEffect(() => {
        if (services) {
            onTotalItemsChange(services.length);
        }
    }, [services, onTotalItemsChange]);

    if (isLoading) return <p>Loading services...</p>;
    if (error) return <p>Error loading services.</p>;

    const groupedServices = services?.reduce((acc: Record<string, typeof services>, service) => {
        const category = service.category?.name || 'Uncategorized';
        acc[category] = acc[category] ? [...acc[category], service] : [service];
        return acc;
    }, {});

    return (
        <div>
            {groupedServices &&
                Object.keys(groupedServices).map((category) => (
                    <div key={category}>
                        <CategoryHeader>{category}</CategoryHeader>
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
                    </div>
                ))}
        </div>
    );
};

export default ServicesList;
