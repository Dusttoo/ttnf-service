import React from 'react';
import styled from 'styled-components';

const NavigationContainer = styled.div`
  position: sticky;
  top: 1rem;
  padding: 1.5rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem; /* Reduce padding for mobile */
    margin-bottom: 1rem;
    top: 0; /* Adjust position to avoid issues on mobile */
  }
`;

const NavItem = styled.a`
  display: block;
  color: ${(props) => props.theme.colors.primary};
  text-decoration: none;
  margin: 1rem 0;
  font-size: 1.2rem;
  font-family: ${(props) => props.theme.fonts.secondary};
  transition: color 0.3s ease;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
  }
`;

interface SectionNavigationProps {
  sections: string[];
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({ sections }) => (
  <NavigationContainer>
    {sections.map((section) => (
      <NavItem key={section} href={`#${section}`}>
        {section}
      </NavItem>
    ))}
  </NavigationContainer>
);

export default SectionNavigation;
