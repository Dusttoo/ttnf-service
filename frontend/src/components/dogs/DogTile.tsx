import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Dog } from '../../api/types/dog';
import { StatusBadge } from '../common/StatusBadge';

const Tile = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  transition: transform 0.2s;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-height: 50vh;
  max-width: 80vw;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  height: auto;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Info = styled.div`
  flex: 2;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const Name = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin: 0.5rem 0;
`;

const Detail = styled.p`
  margin: 0.25rem 0;
  color: ${(props) => props.theme.colors.text};
`;

const StatusContainer = styled.div`
  display: flex;
  padding-top: 5px;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
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

const Description = styled(Detail)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Number of lines to show */
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
        <Link to={`/dogs/${dog.id}`}>
          <Image src={dog.profilePhoto} alt={dog.name} />
        </Link>
      </ImageContainer>
      <Info>
        <div>
          <Name>{dog.name}</Name>
          <Detail>DOB: {dog.dob}</Detail>
          <Detail>Color: {dog.color}</Detail>
          {dog.studFee && <Detail>Stud Fee: ${dog.studFee}</Detail>}
          {dog.saleFee && <Detail>Sale Fee: ${dog.saleFee}</Detail>}
          {dog.description && <Description>Description: {dog.description}</Description>}
          {dog.pedigreeLink && (
            <Detail>
              <a href={dog.pedigreeLink} target="_blank" rel="noopener noreferrer">
                Pedigree Link
              </a>
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
