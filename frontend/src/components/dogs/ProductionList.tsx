import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useProductions } from '../../hooks/useProduction';
import ProductionTile from './ProductionTile';
import FilterComponent from '../common/Filter';
import Pagination from '../common/Pagination';
import { GenderEnum, StatusEnum } from '../../api/types/core';

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;
`;

const ProductionList: React.FC<{ defaultGender?: GenderEnum | undefined }> = ({ defaultGender }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 
    const { data: productionsData, isLoading } = useProductions(currentPage, itemsPerPage);
    const [gender, setGender] = useState<GenderEnum | undefined>(defaultGender ?? undefined);
    const [status, setStatus] = useState<string[] | undefined>([]);

    const productions = productionsData?.items || [];
    const totalItems = productionsData?.totalCount || 0; 

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    return (
        <>
            <FilterComponent
                onGenderChange={setGender}
                onStatusChange={setStatus}
                gender={gender}
                status={status as StatusEnum[]}
                isGenderDisabled={!!defaultGender}
            />
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <ListContainer>
                        {productions.map((production) => (
                            <ProductionTile key={production.id} production={production} />
                        ))}
                    </ListContainer>
                    <Pagination
                        totalItems={totalItems}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </>
    );
};

export default ProductionList;