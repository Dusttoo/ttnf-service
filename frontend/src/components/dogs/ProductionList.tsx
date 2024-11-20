import React, { useState } from 'react';
import styled from 'styled-components';
import { useProductions } from '../../hooks/useProduction';
import ProductionTile from './ProductionTile';
import FilterComponent from '../common/Filter';
import Pagination from '../common/Pagination';
import { GenderEnum, StatusEnum } from '../../api/types/core';
import LoadingSpinner from '../common/LoadingSpinner';
import { Dog, SelectedFilters, Production } from '../../api/types/dog';
import NoResults from '../common/NoResults';

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    align-items: center;
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Section = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1rem;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  margin-bottom: 1.5rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const ProductionList: React.FC<{ defaultGender?: GenderEnum | undefined }> = ({
  defaultGender,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [filters, setFilters] = useState<SelectedFilters>({
    gender: defaultGender,
    sire: undefined,
    dam: undefined,
  });

  const { data: productionsData, isLoading } = useProductions(
    {
      ...filters,
    },
    currentPage,
    itemsPerPage
  );


  const productions = productionsData?.items || [];
  const totalItems = productionsData?.totalCount || 0;


  const handleGenderChange = (gender?: GenderEnum) => {
    setFilters((prevFilters) => ({ ...prevFilters, gender }));
  };

  const handleSireChange = (sire?: Dog) => {
    setFilters((prevFilters) => ({ ...prevFilters, sire }));
  };

  const handleDamChange = (dam?: Dog) => {
    setFilters((prevFilters) => ({ ...prevFilters, dam }));
  };

  const handlePageChange = (page: number, newItemsPerPage: number) => {
    setCurrentPage(page);
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <>
      <ListHeader>
        <FilterComponent
          isStatusDisabled={true}
          isSireDisabled={false}
          isDamDisabled={false}
          onGenderChange={handleGenderChange}
          onSireChange={handleSireChange}
          onDamChange={handleDamChange}
          gender={filters.gender}
          sire={filters.sire}
          dam={filters.dam}
        />
      </ListHeader>

      <Section>
        <SectionTitle>Productions</SectionTitle>
        {!isLoading ? (
          <ListContainer>
            {productions.length > 0 ? (
              productions.map((production: Production) => (
                <ProductionTile key={production.id} production={production} />
              ))
            ) : (
              <NoResults />
            )}
          </ListContainer>
        ) : (
          <LoadingSpinner />
        )}

        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Section>
    </>
  );
};

export default ProductionList;
