import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getBreedings } from '../../api/breedingApi';
import { Breeding } from '../../api/types/breeding';
import BreedingCard from '../../components/breedings/BreedingCard';
import Container from '../../components/common/Container';
import Pagination from '../../components/common/Pagination';
import NoResults from '../../components/common/NoResults';

const BreedingList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const BreedingPage: React.FC = () => {
    const [breedings, setBreedings] = useState<Breeding[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const fetchBreedings = async () => {
            const data = await getBreedings(currentPage, itemsPerPage); 
            setBreedings(data.items);
            setTotalItems(data.total); 
        };
        fetchBreedings();
    }, [currentPage, itemsPerPage]);

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    return (
        <Container>
            <h1>Breedings</h1>
            {breedings.length > 0 ? 
            <>
            <BreedingList>
                {breedings.map((breeding) => (
                    <BreedingCard key={breeding.id} breeding={breeding} />
                ))}
            </BreedingList>
            <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
            </> :
            <NoResults message={"No breedings at the moment"} description={"Check back soon."} />}
            
        </Container>
    );
};

export default BreedingPage;