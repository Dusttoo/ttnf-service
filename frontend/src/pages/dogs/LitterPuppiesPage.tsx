import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Photo } from '../../api/types/dog';
import ImageGallery from '../../components/common/ImageGallery';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useBreedingById } from '../../hooks/useBreeding';
import { useLitter } from '../../hooks/useLitter';

const Tile = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem auto;
  transition: transform 0.2s;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Container = styled.div`
    display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const Title = styled.h1`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.colors.primary};
    text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  width: 100%;
`;

const SubHeader = styled.h2`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.primary};
  margin-bottom: 1.5rem;
  text-align: center;
  `;

const ParentContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const ParentInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ParentImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10%;
  margin-bottom: 0.5rem;
`;

const Detail = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
  margin: 0.25rem 0;
  text-align: center;
`;

const PuppyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  background-color: 
`;

const PuppyCard = styled.div`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s;
  width: 80vw;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PuppyImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const PuppyName = styled.h3`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  margin: 0.5rem 0;
`;

const LitterPuppiesPage: React.FC = () => {
    const { litterId } = useParams<{ litterId: string }>();
    const { data: litter, isLoading: litterLoading } = useLitter(Number(litterId), { enabled: !!litterId });
    const { data: breeding } = useBreedingById(litter?.breedingId);
    console.log(litterId)
    if (litterLoading) {
        return <LoadingSpinner />;
    }

    // Compile images for carousel using each puppy's profile photo (and optionally gallery photos)
    const compilePuppyImages = () => {
        const images: Photo[] = [];
        litter?.puppies.forEach((puppy, index) => {
            if (puppy.profilePhoto) {
                images.push({
                    id: puppy.id,
                    dogId: puppy.id,
                    photoUrl: puppy.profilePhoto,
                    position: index,
                    alt: `${puppy.name}'s profile photo`,
                });
            }
            if (puppy.photos && Array.isArray(puppy.photos)) {
                puppy.photos.forEach(photo => images.push(photo));
            }
        });
        return images;
    };

    return (
        <Container>
            <Tile>
                <Title>Litter Details</Title>
                <Section>
                    <SubHeader>Parents Information</SubHeader>
                    <ParentContainer>
                        {breeding?.femaleDog && (
                            <ParentInfo>
                                <ParentImage src={breeding.femaleDog.profilePhoto} alt={breeding.femaleDog.name} />
                                <PuppyName>{breeding.femaleDog.name}</PuppyName>
                            </ParentInfo>
                        )}
                        {breeding && (breeding.maleDog || breeding.manualSireImageUrl) && (
                            <ParentInfo>
                                <ParentImage
                                    src={breeding.maleDog?.profilePhoto ?? breeding.manualSireImageUrl ?? 'path/to/default-image.jpg'}
                                    alt={breeding.maleDog?.name ?? breeding.manualSireName ?? 'Unknown Sire'}
                                />
                                <PuppyName>{breeding.maleDog?.name ?? breeding.manualSireName ?? 'Unknown Sire'}</PuppyName>
                            </ParentInfo>
                        )}
                    </ParentContainer>
                    <Detail><strong>Puppies born on </strong> {litter?.birthDate ? new Date(litter.birthDate + "T00:00:00").toLocaleDateString() : 'N/A'}</Detail>
                    {litter?.description && (
                        <Detail>{litter.description.content}</Detail>
                    )}
                </Section>
                <Section>
                    <SubHeader>Puppies</SubHeader>
                    <PuppyList>
                        {litter && litter.puppies.map((puppy) => (
                            <PuppyCard key={puppy.id}>
                                <PuppyImage src={puppy.profilePhoto} alt={puppy.name} />
                                <PuppyName>{puppy.name}</PuppyName>
                            </PuppyCard>
                        ))}
                    </PuppyList>
                    <SubHeader>Images</SubHeader>

                    {litter && litter.puppies.length > 0 && (
                        // <ImageCarousel images={compilePuppyImages()} initialIndex={0} width="100%" height="400px" />
                        <ImageGallery images={compilePuppyImages()} />
                    )}
                </Section>
                {/* <Section>
                    <Link to="/litters">Back to Litters</Link>
                </Section> */}
            </Tile>
        </Container>
    );
};

export default LitterPuppiesPage;