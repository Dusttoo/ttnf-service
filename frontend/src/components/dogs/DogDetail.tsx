import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
`;

const Detail = styled.p`
  color: ${(props) => props.theme.colors.text};
  font-size: 1.1rem;
  margin: 0.5rem 0;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const DogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [dog, setDog] = useState<Dog | null>(null);
    useEffect(() => {
        const fetchDog = async () => {
            console.log("dog id: ", id)

            if (id) {
                const data = await getDogById(parseInt(id));
                setDog(data);
            }
        };
        fetchDog();
    }, [id]);

    if (!dog) return <LoadingSpinner/>;

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
        <DogDetailContainer>
            <Header>{dog.name}</Header>
            <ImageContainer>
                <Image src={dog.profilePhoto} alt={dog.name} />
            </ImageContainer>
            <Section>
                {dog.status && <StatusBadge color={getStatusColor(dog.status)}>{dog.status}</StatusBadge>}
                <Detail><strong>Age:</strong> {dog.dob}</Detail>
                <Detail><strong>Gender:</strong> {dog.gender}</Detail>
                <Detail><strong>Color:</strong> {dog.color}</Detail>
                {dog.studFee && <Detail><strong>Stud Fee:</strong> ${dog.studFee}</Detail>}
                {dog.saleFee && <Detail><strong>Sale Fee:</strong> ${dog.saleFee}</Detail>}
                <Detail><strong>Description:</strong> {dog.description}</Detail>
                {dog.pedigreeLink && (
                    <Detail>
                        <a href={dog.pedigreeLink} target="_blank" rel="noopener noreferrer">
                            Pedigree Link
                        </a>
                    </Detail>
                )}
                <ImageGallery images={dog.photos} />
            </Section>
        </DogDetailContainer>
    );
};

export default DogDetailPage;
