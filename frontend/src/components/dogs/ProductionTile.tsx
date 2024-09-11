import React from 'react';
import styled from 'styled-components';
import { Production } from '../../api/types/dog';

const TileContainer = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  padding: 1rem;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  height: 350px;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProductionImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductionName = styled.h3`
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
`;

interface ProductionTileProps {
    production: Production;
}

const ProductionTile: React.FC<ProductionTileProps> = ({ production }) => {
    return (
        <TileContainer>
            <ProductionImage src={production.profilePhoto} alt={production.name} />
            <ProductionName>{production.name}</ProductionName>
        </TileContainer>
    );
};

export default ProductionTile;