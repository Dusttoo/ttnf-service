import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'
import { Dog } from '../../api/types/dog';
import { StatusBadge } from '../common/StatusBadge';
import { LinkComponent } from '../common/Link'

const Tile = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 700px;
  width: 100%;
  height: auto;
  flex-direction: column;


  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    align-items: stretch;
    max-height: none;
    height: auto;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 0;
  padding-top: 56.25%; /* This maintains a 16:9 aspect ratio (you can adjust for other ratios) */
  position: relative;
  overflow: hidden;
  border-radius: 8px 8px 0 0;

  @media (max-width: 768px) {
    padding-top: 75%; /* For mobile screens, adjust aspect ratio to be taller if needed */
  }
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 8px 8px 0 0;
`;

const Info = styled.div`
  flex: 2;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 95%;


  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const Name = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin: 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Detail = styled.p`
  margin: 0.25rem 0;
  color: ${(props) => props.theme.colors.text};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 95%;
`;

const ViewProfileLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border-radius: 4px;
  text-decoration: none;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const StatusContainer = styled.div`
  display: flex;
  padding-top: 5px;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Description = styled(Detail)`
  overflow: hidden;
  text-wrap: pretty;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const DogTile: React.FC<{ dog: Dog }> = ({ dog }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return 'green';
      case 'sold':
        return 'gray';
      case 'stud':
        return 'blue';
      case 'retired':
        return 'red';
      default:
        return 'black';
    }
  };

  return (
    <Tile>
      <ImageContainer>
        <LinkComponent to={`/dogs/${dog.id}`}>
          <Image src={dog.profilePhoto} alt={dog.name} />
        </LinkComponent>
      </ImageContainer>
      <Info>
        <div>
          <Name>{dog.name}</Name>
          {dog.dob && <Detail>DOB: {dog.dob}</Detail>}
          {dog.color && <Detail>Color: {dog.color}</Detail>}
          {dog.studFee && <Detail>Stud Fee: ${dog.studFee}</Detail>}
          {dog.saleFee && <Detail>Sale Fee: ${dog.saleFee}</Detail>}
          {dog.description && <Description>{dog.description}</Description>}
          {dog.pedigreeLink && (
            <Detail>
              <LinkComponent to={dog.pedigreeLink} target="_blank" rel="noopener noreferrer">
                Pedigree Link
              </LinkComponent>
            </Detail>
          )}
          <ViewProfileLink to={`/dogs/${dog.id}`}>View Profile</ViewProfileLink>
          {dog.status && (
            <StatusContainer>
              <StatusBadge color={getStatusColor(dog.status)}>{dog.status}</StatusBadge>
            </StatusContainer>
          )}
        </div>
      </Info>
    </Tile>
  );
};

export default DogTile;
