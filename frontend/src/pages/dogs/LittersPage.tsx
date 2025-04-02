import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Litter } from '../../api/types/breeding';
import LitterCard from '../../components/breedings/LitterCard';
import Container from '../../components/common/Container';
import ErrorComponent from '../../components/common/Error';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NoResults from '../../components/common/NoResults';
import Pagination from '../../components/common/Pagination';
import { useLitters } from '../../hooks/useLitter';


const LitterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const LitterPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { data, isLoading, isError } = useLitters(currentPage, itemsPerPage);

    const totalItems = data?.totalCount || 0;
    const litters = data?.items || [];
    console.log('litters', litters)


    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorComponent message='Something went wrong' />;

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