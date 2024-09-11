import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getBreedings } from '../../api/breedingApi';
import { Breeding } from '../../api/types/breeding';
import BreedingCard from '../../components/breedings/BreedingCard';
import Container from '../../components/common/Container';

const BreedingList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const BreedingPage: React.FC = () => {
    const [breedings, setBreedings] = useState<Breeding[]>([]);

    useEffect(() => {
        const fetchBreedings = async () => {
            const data = await getBreedings();
            setBreedings(data.items);
        };
        fetchBreedings();
    }, []);

    return (
        <Container>
            <h1>Breedings</h1>
            <BreedingList>
                {breedings.map((breeding) => (
                    <BreedingCard key={breeding.id} breeding={breeding} />
                ))}
            </BreedingList>
        </Container>
    );
};

export default BreedingPage;
