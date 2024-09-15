import React, { useState } from 'react';
import styled from 'styled-components';
import { useDogs } from '../../hooks/useDog';
import DogTile from './DogTile';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { GenderEnum, StatusEnum } from '../../api/types/core';
import {SelectedFilters, Dog} from '../../api/types/dog';
import FilterComponent from '../common/Filter';

// Styled containers
const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;
`;

const Section = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Styled components for tab navigation
const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.primary};
  background-color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.secondaryBackground)};
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.text)};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const DogList: React.FC<{ defaultGender?: GenderEnum | undefined, owned?: boolean }> = ({ defaultGender, owned }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedTab, setSelectedTab] = useState<'active' | 'retired'>('active');
    const [filters, setFilters] = useState<SelectedFilters>({});

    // Fetch dogs based on tab selection and filters
    const { data: dogsData, isLoading } = useDogs(
        { ...filters, status: selectedTab === 'active' ? [StatusEnum.Active] : [StatusEnum.Retired], owned, gender: defaultGender },
        currentPage,
        itemsPerPage
    );

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(newItemsPerPage);
    };

    const handleGenderChange = (gender?: GenderEnum) => {
        setFilters((prevFilters) => ({ ...prevFilters, gender }));
      };

    if (isLoading) return <LoadingSpinner />;

    return (
        <>
            {/* Filter and Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                <FilterComponent onGenderChange={handleGenderChange} gender={defaultGender} />
                <TabContainer>
                    <TabButton active={selectedTab === 'active'} onClick={() => setSelectedTab('active')}>
                        Active Dogs
                    </TabButton>
                    <TabButton active={selectedTab === 'retired'} onClick={() => setSelectedTab('retired')}>
                        Retired Dogs
                    </TabButton>
                </TabContainer>
            </div>

            {/* Dog List */}
            <Section>
                <SectionTitle>{selectedTab === 'active' ? 'Active Dogs' : 'Retired Dogs'}</SectionTitle>
                <ListContainer>
                    {dogsData?.items.map((dog: Dog) => (
                        <DogTile key={dog.id} dog={dog} />
                    ))}
                </ListContainer>
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