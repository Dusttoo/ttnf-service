import React, { useState } from 'react';
import styled from 'styled-components';
import { useDogs } from '../../hooks/useDog';
import DogTile from './DogTile';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { GenderEnum, StatusEnum } from '../../api/types/core';
import { SelectedFilters, Dog } from '../../api/types/dog';
import FilterComponent from '../common/Filter';
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

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    justify-content: flex-start;
    margin-bottom: 1rem;
    overflow-x: auto;
    flex-wrap: wrap;
  }
`;
const TabButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.primary};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.secondaryBackground};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.text};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    margin: 5px;
    white-space: nowrap;
  }
`;

const DogList: React.FC<{
  defaultGender?: GenderEnum | undefined;
  owned?: boolean;
  availablePage?: boolean;
}> = ({ defaultGender, owned, availablePage = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedTab, setSelectedTab] = useState<'active' | 'retired'>(
    'active'
  );

  const [filters, setFilters] = useState<SelectedFilters>({
    status: [],
    color: '',
    sire: undefined,
    dam: undefined,
  });

  let effectiveStatus =
    selectedTab === 'active'
      ? [
          ...(filters.status ?? []).filter(
            (status) => status !== StatusEnum.Retired
          ),
          StatusEnum.Active,
        ]
      : [
          ...(filters.status ?? []).filter(
            (status) => status !== StatusEnum.Active
          ),
          StatusEnum.Retired,
        ];

  if (availablePage) {
    filters.status = [StatusEnum.Available];
    effectiveStatus = [StatusEnum.Available];
  }

  console.log(filters);

  const { data: dogsData, isLoading } = useDogs(
    {
      ...filters,
      status: effectiveStatus,
      owned,
      gender: defaultGender,
    },
    currentPage,
    itemsPerPage
  );

  const handlePageChange = (page: number, newItemsPerPage: number) => {
    setCurrentPage(page);
    setItemsPerPage(newItemsPerPage);
  };

  const handleStatusChange = (status: StatusEnum[]) => {
    setFilters((prevFilters) => ({ ...prevFilters, status }));
  };

  const handleColorChange = (color: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, color }));
  };

  const handleSireChange = (sire?: Dog) => {
    setFilters((prevFilters) => ({ ...prevFilters, sire }));
  };

  const handleDamChange = (dam?: Dog) => {
    setFilters((prevFilters) => ({ ...prevFilters, dam }));
  };

  const handleTabChange = (selectedTab: 'active' | 'retired') => {
    setSelectedTab(selectedTab);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <ListHeader>
        <FilterComponent
          onGenderChange={() => {}}
          isGenderDisabled={true}
          isSireDisabled={false}
          isDamDisabled={false}
          onStatusChange={handleStatusChange}
          //          onColorChange={handleColorChange}
          onSireChange={handleSireChange}
          onDamChange={handleDamChange}
          status={filters.status}
          //          color={filters.color}
          sire={filters.sire}
          dam={filters.dam}
        />
        {!availablePage && (
          <TabContainer>
            <TabButton
              active={selectedTab === 'active'}
              onClick={() => setSelectedTab('active')}
            >
              Active Dogs
            </TabButton>
            <TabButton
              active={selectedTab === 'retired'}
              onClick={() => setSelectedTab('retired')}
            >
              Retired Dogs
            </TabButton>
          </TabContainer>
        )}
      </ListHeader>

      <Section>
        <SectionTitle>
          {selectedTab === 'active' ? 'Active Dogs' : 'Retired Dogs'}
        </SectionTitle>
        {!isLoading ? (
          <ListContainer>
            {dogsData?.items.map((dog: Dog) => (
              <DogTile key={dog.id} dog={dog} />
            ))}
            {dogsData?.items.length === 0 && <NoResults />}
          </ListContainer>
        ) : (
          <LoadingSpinner />
        )}

        <Pagination
          totalItems={dogsData?.total || 0}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Section>
    </>
  );
};

export default DogList;
