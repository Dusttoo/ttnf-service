import React from 'react';
import styled from 'styled-components';
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

const services = [
  {
    category: "Repro Services",
    items: [
      {
        name: "Semen collection for analysis only",
        description: "Complete semen collection for analysis purposes.",
        price: "$30",
        availability: "Available",
        ctaName: "Book Now",
        ctaLink: "/services/book/semen-analysis",
        disclaimer: "Contact us for further information."
      },
      {
        name: "Semen collection w/ AI and analysis",
        description: "Semen collection combined with AI and analysis.",
        price: "$50",
        availability: "Available",
        ctaName: "Book Now",
        ctaLink: "/services/book/semen-ai",
        disclaimer: "Please ensure your pet is in good health before booking."
      },
      {
        name: "Semen packaging for shipment",
        description: "Packaging semen with optional box for shipment.",
        price: "$75 with box",
        availability: "Limited",
        ctaName: "Order Now",
        ctaLink: "/services/order/semen-shipment",
        disclaimer: "Shipment availability depends on region."
      },
      // Add more services...
    ]
  },
  // Add more categories...
];

const ServicesList: React.FC = () => {
  return (
    <div>
      {services.map((serviceCategory) => (
        <div key={serviceCategory.category}>
          <CategoryHeader>{serviceCategory.category}</CategoryHeader>
          <ServiceListContainer>
            {serviceCategory.items.map((service, index) => (
              <ServiceCard
                key={index}
                name={service.name}
                description={service.description}
                price={service.price}
                availability={service.availability}
                ctaName={service.ctaName}
                ctaLink={service.ctaLink}
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