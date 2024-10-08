import React from 'react';
import styled from 'styled-components';
import { useLocation, Link } from 'react-router-dom';

// Styled Components
const StyledContainer = styled.div`
  padding: 2rem 2rem 2rem 1rem;
  background-color: ${(props) => props.theme.colors.background};
  margin: auto;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  max-width: 1200px;
`;

const LinkComponent = styled(Link)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.primary};
  margin-right: 0.5rem;

  &:after {
    content: '>';
    margin-left: 0.5rem;
  }

  &:last-child:after {
    content: '';
  }
`;

// Style for the current breadcrumb (non-clickable)
const CurrentCrumb = styled.span`
  color: ${(props) => props.theme.ui.nav.hover};  // Different color for emphasis
  font-weight: bold;  // Make it bold to stand out
  margin-right: 0.5rem;
  padding-bottom: 2px;
  border-bottom: 1px solid ${(props) => props.theme.ui.nav.hover};
`;

// Function to format dynamic segments (e.g., 'Thunder-Cat' -> 'Thunder Cat')
const formatSegment = (segment: string) => {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter(crumb => crumb);

  return (
    <StyledContainer>
      <span>
        {pathnames.length > 1 && pathnames.map((crumb, index) => {
          const path = `/${pathnames.slice(0, index + 1).join('/')}`;

          const displayName = formatSegment(crumb);

          if (index === pathnames.length - 1) {
            return <CurrentCrumb key={path}>{displayName}</CurrentCrumb>;
          }

          return (
            <LinkComponent key={path} to={path}>
              {displayName}
            </LinkComponent>
          );
        })}
      </span>
    </StyledContainer>
  );
};

export default Breadcrumb;