import React from 'react';
import styled from 'styled-components';
import { Production } from '../../api/types/dog';

const TileContainer = styled.div`
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  padding: 1rem;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 250px;
  height: 400px;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProductionImage = styled.img`
  width: 100%;
  max-height: 60%;
  aspect-ratio: 4/3;
  object-fit: contain;
  border-radius: 4px;
`;

const ProductionName = styled.h3`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin: 0.5rem 0;
`;

const ProductionDetails = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ProductionDescription = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0.5rem 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductionTile: React.FC<{ production: Production }> = ({
                                                                  production,
                                                              }) => {
    return (
        <TileContainer>
            <ProductionImage
                src={production.profilePhoto ? production.profilePhoto : 'https://ttnfas.blob.core.windows.net/ttnf/dogs/logo.af08c321461d0f484883.png'}
                alt={production.name} />
            <ProductionName>{production.name}</ProductionName>
            {production.description && (
                <ProductionDescription>{production.description}</ProductionDescription>
            )}
            {production.dob && (
                <ProductionDetails>
                    DOB: {production.dob.toString()}
                </ProductionDetails>
            )}
        </TileContainer>
    );
};

export default ProductionTile;
