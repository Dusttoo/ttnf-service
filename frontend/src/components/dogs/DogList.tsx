import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getDogsFiltered } from '../../api/dogApi';
import { Dog } from '../../api/types/dog';
import DogTile from './DogTile';
import FilterComponent from '../common/Filter';
import { GenderEnum, StatusEnum } from '../../api/types/core';

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;
`;

const DogList: React.FC<{ defaultGender?: GenderEnum | undefined, owned?: boolean }> = ({ defaultGender, owned }) => {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [gender, setGender] = useState<GenderEnum | undefined>(defaultGender ?? undefined);
    const [status, setStatus] = useState<string[] | undefined>([]);

    useEffect(() => {
        const fetchDogs = async () => {
            const dogData = await getDogsFiltered({ gender, status, owned });
            setDogs(dogData.items);
        };

        fetchDogs();
    }, [gender, status, owned]);

    return (
        <>
            <FilterComponent
                onGenderChange={setGender}
                onStatusChange={setStatus}
                gender={gender}
                status={status as StatusEnum[]}
                isGenderDisabled={!!defaultGender}
            />
            <ListContainer>
                {dogs.map((dog) => (
                    <DogTile key={dog.id} dog={dog} />
                ))}
            </ListContainer>
        </>
    );
};

export default DogList;
