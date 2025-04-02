import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Breeding } from '../../api/types/breeding';

const Tile = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 80vw;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ImagesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-height: 75%;

`;

const ImageContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9; /* Maintain a 16:9 aspect ratio */
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 1000px) {
    aspect-ratio: 4 / 3; /* Adjust aspect ratio for larger screens */
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* Ensure the whole image fits within the container */
  object-position: center;

  @media (min-width: 1000px) {
    max-height: 500px; /* Prevent images from becoming too large */
  }
`;

const Info = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const Name = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin: 0.5rem 0;
  text-align: center;
`;

const Detail = styled.p`
  margin: 0.25rem 0;
  color: ${(props) => props.theme.colors.text};
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

const BreedingCard: React.FC<{ breeding: Breeding }> = ({ breeding }) => {
  return (
    <Tile>
      <ImagesWrapper>
        <ImageContainer>
          {breeding.maleDog ? (
            <Link to={`/dogs/${breeding.maleDog.name}`}>
              <Image src={breeding.maleDog.profilePhoto} alt={breeding.maleDog.name} />
            </Link>
          ) : (
            <Image src={breeding.manualSireImageUrl || 'path/to/default-image.jpg'}
              alt={breeding.manualSireName || 'Unknown Sire'} />
          )}
        </ImageContainer>
        <ImageContainer>
          <Link to={`/dogs/${breeding.femaleDog.name}`}>
            <Image src={breeding.femaleDog.profilePhoto} alt={breeding.femaleDog.name} />
          </Link>
        </ImageContainer>
      </ImagesWrapper>
      <Info>
        <Name>
          {(breeding.maleDog?.name || breeding.manualSireName || 'Unknown Sire')} &amp; {breeding.femaleDog.name}
        </Name>
        <Detail>Breeding Date: {breeding.breedingDate}</Detail>
        <Detail>Expected Birth Date: {breeding.expectedBirthDate}</Detail>
        <Description>Description: {breeding.description}</Description>
        {/* <ViewProfileLink
                    to={`/breedings/${breeding.maleDog ? breeding.maleDog.id : 'manual'}-${breeding.femaleDog.id}`}>View
                    Breeding</ViewProfileLink> */}
      </Info>
    </Tile>
  );
};

export default BreedingCard;
