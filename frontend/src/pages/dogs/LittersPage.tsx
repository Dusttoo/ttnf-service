import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLitters } from '../../hooks/useLitter';
import { Litter } from '../../api/types/breeding';
import LitterCard from '../../components/breedings/LitterCard';
import Container from '../../components/common/Container';
import Pagination from '../../components/common/Pagination';
import NoResults from '../../components/common/NoResults';

const LitterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const LitterPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);  // Default items per page
    const { data, isLoading, isError } = useLitters(currentPage, itemsPerPage);

    const totalItems = data?.totalCount || 0;
    const litters = data?.items || [];

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching litters</div>;

    return (
        <Container>
            <h1>Litters</h1>
            {litters.length > 0 ?
                <>
                    <LitterList>
                        {litters.map((litter: Litter) => (
                            <LitterCard key={litter.id} litter={litter} />
                        ))}
                    </LitterList>
                    <Pagination
                        totalItems={totalItems}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </> : <NoResults message={"No litters at the moment"} description={"Check out the breedings page for our future plans."} />}

        </Container>
    );
};

export default LitterPage;