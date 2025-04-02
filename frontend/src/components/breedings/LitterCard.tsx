import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Litter } from '../../api/types/breeding';
import { Dog } from '../../api/types/dog';
import { useBreedingById } from '../../hooks/useBreeding';
import ImageCarousel from '../common/ImageCarousel';

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

interface LitterCardProps {
  litter: Litter;
}

const LitterCard: React.FC<LitterCardProps> = ({ litter }) => {
  // Fetch breeding using the breedingId from the litter.
  const { data: breeding, isLoading, error } = useBreedingById(litter.breedingId);
  interface CarouselImage {
    id: number | string;
    src: string;
    alt: string;
  }

  function compileLitterPuppyImages(litter: Dog[]): CarouselImage[] {
    const images: CarouselImage[] = [];

    litter.forEach((puppy) => {
      // Add the puppy's profile photo if available
      if (puppy.profilePhoto) {
        images.push({
          id: `profile-${puppy.id}`,
          src: puppy.profilePhoto,
          alt: `${puppy.name}'s profile photo`,
        });
      }
      // Add each photo from the puppy's photos array
      if (puppy.photos && Array.isArray(puppy.photos)) {
        puppy.photos.forEach((photo) => {
          images.push({
            id: photo.id,
            src: photo.photoUrl,
            alt: photo.alt,
          });
        });
      }
    });

    return images;
  }
  if (isLoading) return <Tile>Loading breeding...</Tile>;
  if (error) return <Tile>Error loading breeding</Tile>;

  return (
    <Tile>
      <ImagesWrapper>
        <ImageContainer>
          {litter.breeding.maleDog ? (
            <Link to={`/dogs/${litter.breeding.maleDog.name}`}>
              <Image src={litter.breeding?.maleDog.profilePhoto} alt={litter.breeding?.maleDog.name} />
            </Link>
          ) : (
            <Image src={litter.breeding.manualSireImageUrl || 'path/to/default-image.jpg'}
              alt={litter.breeding.manualSireName || 'Unknown Sire'} />
          )}
        </ImageContainer>
        <ImageContainer>
          {litter.breeding.femaleDog ? (
            <Link to={`/dogs/${litter.breeding.femaleDog.name}`}>
              <Image src={litter.breeding?.femaleDog.profilePhoto} alt={litter.breeding?.femaleDog.name} />
            </Link>
          ) : (
            <Image src={'path/to/default-image.jpg'}
              alt={'Unknown Sire'} />
          )}
        </ImageContainer>
      </ImagesWrapper>
      <Info>
        <Name>
          {(litter.breeding.maleDog?.name || litter.breeding.manualSireName || 'Unknown Sire')} &amp; {litter.breeding.femaleDog.name}
        </Name>
        <Detail>{`Birth Date: ${litter.birthDate}`}</Detail>
        <Detail>{`Number of Puppies: ${litter.numberOfPuppies}`}</Detail>
        <Description style={litter.description?.style}>{litter.description ? litter.description.content : ''}</Description>
        {litter.pedigreeUrl && <ViewProfileLink to={litter.pedigreeUrl}>View Pedigree</ViewProfileLink>}
        <ImageCarousel images={compileLitterPuppyImages(litter.puppies)} height='250px' settings={{ slidesToShow: 2 }} />
        <ViewProfileLink to={`/litters/${litter.id}/puppies`} >View Litter </ViewProfileLink>

      </Info>

    </Tile>
  );
};

export default LitterCard;