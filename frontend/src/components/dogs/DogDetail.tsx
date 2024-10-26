import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getDogById } from '../../api/dogApi';
import { Dog } from '../../api/types/dog';
import styled from 'styled-components';
import { StatusBadge } from '../common/StatusBadge';
import ImageGallery from '../common/ImageGallery';
import LoadingSpinner from '../common/LoadingSpinner';

const DogDetailContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const Header = styled.h1`
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 1rem;
`;

const ImageContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Image = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Detail = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-size: 1.1rem;
  margin: 0.5rem 0;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const PedigreeLink = styled.a`
  color: ${(props) => props.theme.colors.accent};
  font-weight: bold;
  text-decoration: underline;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const DogDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [searchParams] = useSearchParams();
  const [dog, setDog] = useState<Dog | null>(null);

  useEffect(() => {
    const fetchDog = async () => {
      if (name) {
        const id = searchParams.get('id') || '0';
        const data = await getDogById(parseInt(id));
        setDog(data);
      }
    };
    fetchDog();
  }, [name]);

  if (!dog) return <LoadingSpinner />;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Available For Stud':
        return '#28a745'; // green
      case 'Sold':
        return '#6c757d'; // gray
      case 'Stud':
        return '#007bff'; // blue
      case 'Retired':
        return '#dc3545'; // red
      default:
        return "#E0E0E0";
    }
  };

  return (
    <DogDetailContainer>
      <Header>{dog.name}</Header>
      <ImageContainer>
        <Image src={dog.profilePhoto} alt={dog.name} />
      </ImageContainer>
      <Section>
        {dog.status && (
          <StatusBadge color={getStatusColor(dog.status)}>
            {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
          </StatusBadge>
        )}
        <Detail>
          <strong>Age:</strong> {dog.dob}
        </Detail>
        <Detail>
          <strong>Gender:</strong> {dog.gender}
        </Detail>
        <Detail>
          <strong>Color:</strong> {dog.color}
        </Detail>
        {dog.studFee && (
          <Detail>
            <strong>Stud Fee:</strong> ${dog.studFee}
          </Detail>
        )}
        {dog.saleFee && (
          <Detail>
            <strong>Sale Fee:</strong> ${dog.saleFee}
          </Detail>
        )}
        <Detail>
          <strong>Description:</strong> {dog.description}
        </Detail>
        {dog.pedigreeLink && (
          <Detail>
            <PedigreeLink
              href={dog.pedigreeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pedigree Link
            </PedigreeLink>
          </Detail>
        )}
        <ImageGallery images={dog.photos} />
      </Section>
    </DogDetailContainer>
  );
};

export default DogDetailPage;