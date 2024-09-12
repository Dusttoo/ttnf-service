import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getDogsFiltered } from '../../api/dogApi';
import { Dog } from '../../api/types/dog';
import DogTile from './DogTile';
import FilterComponent from '../common/Filter';
import Pagination from '../common/Pagination';
import { GenderEnum, StatusEnum } from '../../api/types/core';
import LoadingSpinner from '../common/LoadingSpinner';

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;
`;

const DogList: React.FC<{ defaultGender?: GenderEnum | undefined, owned?: boolean }> = ({ defaultGender, owned }) => {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [gender, setGender] = useState<GenderEnum | undefined>(defaultGender ?? undefined);
    const [status, setStatus] = useState<string[] | undefined>([]);
    const [totalItems, setTotalItems] = useState(0); 

    useEffect(() => {
        const fetchDogs = async () => {
            const dogData = await getDogsFiltered({ gender, status, owned }, currentPage, itemsPerPage);
            setDogs(dogData.items);
            setTotalItems(dogData.total); 
        };

        fetchDogs();
    }, [gender, status, owned, currentPage, itemsPerPage]);

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    if (dogs.length === 0) return <LoadingSpinner />

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
            <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
        </>
    );
};

export default DogList;