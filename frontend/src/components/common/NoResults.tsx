import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons'; 

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const NoResultsMessage = styled.h2`
  font-family: ${(props) => props.theme.fonts.secondary};
  color: ${(props) => props.theme.colors.primary};
  margin-top: 1rem;
`;

const NoResultsDescription = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.secondaryText};
  margin-top: 0.5rem;
`;

const NoResultsIconWrapper = styled.div`
  margin-top: 1rem;
  font-size: 3rem; /* Adjust the icon size */
  color: ${(props) => props.theme.colors.accent}; /* Use theme's accent color */
`;

const NoResults: React.FC<{ message?: string; description?: string }> = ({
    message = "No results found",
    description = "Try adjusting your filters or check back later.",
}) => {
    return (
        <NoResultsContainer>
            <NoResultsIconWrapper>
                <FontAwesomeIcon icon={faBoxOpen} />
            </NoResultsIconWrapper>
            <NoResultsMessage>{message}</NoResultsMessage>
            <NoResultsDescription>{description}</NoResultsDescription>
        </NoResultsContainer>
    );
};

export default NoResults;