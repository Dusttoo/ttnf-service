import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dog, SelectedFilters } from '../../../../api/types/dog';
import FilterComponent from '../../../common/Filter';
import Pagination from '../../../common/Pagination';
import GlobalModal from '../../../common/Modal';
import DogForm from './DogForm';
import { useDogs, useDeleteDog } from '../../../../hooks/useDog';
import { useNavigate } from 'react-router-dom';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  max-height: 100%;
  box-sizing: border-box;
  overflow: scroll;
`;

const DogCard = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 1rem;
  padding: 1rem;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  height: 350px;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0.5rem 0;
  }
`;

const DogImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;

const DogName = styled.h3`
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  flex: 1;
  margin: 0 0.25rem;
  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const AddNewDogButton = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  margin: 1rem 0;
  align-self: flex-end;
  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const PaginationWrapper = styled.div`
  margin-top: 2rem;
`;

const AdminDogList: React.FC<{ defaultGender?: string; owned?: boolean }> = ({ defaultGender, owned }) => {
    const navigate = useNavigate();
    const [gender, setGender] = useState<string>(defaultGender || '');
    const [status, setStatus] = useState<string[]>([]);
    const [sire, setSire] = useState<Dog | undefined>(undefined);
    const [dam, setDam] = useState<Dog | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filters: SelectedFilters = { gender, status, owned, sire: sire, dam: dam };
    const { data: dogsData, isLoading } = useDogs(filters, page, pageSize);

    const dogs = dogsData?.items ?? [];
    const totalCount = dogsData?.total ?? 0;

    const deleteDogMutation = useDeleteDog();

    const handlePageChange = (newPage: number, newItemsPerPage: number) => {
        setPage(newPage);
        setPageSize(newItemsPerPage);
    };

    const handleSireChange = (sire?: Dog) => {
        setSire(sire);
    };

    const handleDamChange = (dam?: Dog) => {
        setDam(dam);
    };

    const handleEdit = (dogId: number) => {
        setModalContent(
            <DogForm
                onClose={() => setIsModalOpen(false)}
                dogId={dogId}
                title="Edit Dog"
                redirect="/admin/dashboard/dogs"
            />
        );
        setIsModalOpen(true);
    };

    const handleDelete = (dogId: number) => {
        if (window.confirm('Are you sure you want to delete this dog?')) {
            deleteDogMutation.mutate(dogId);
        }
    };

    const handleAddNewDog = () => {
        setModalContent(
            <DogForm
                onClose={() => setIsModalOpen(false)}
                title="Add New Dog"
                redirect="/admin/dashboard/dogs"
            />
        );
        setIsModalOpen(true);
    };

    return (
        <ListWrapper>
            <FilterComponent
                onGenderChange={setGender}
                onStatusChange={setStatus}
                onSireChange={handleSireChange}
                onDamChange={handleDamChange}
                gender={gender}
                status={status}
                isGenderDisabled={!!defaultGender}
                isSireDisabled={false}
                isDamDisabled={false}
            />
            <AddNewDogButton onClick={handleAddNewDog}>Add New Dog</AddNewDogButton>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {dogs.length > 0 ? (
                        <ListContainer>
                            {dogs.map((dog: Dog) => (
                                <DogCard key={dog.id}>
                                    <DogImage src={dog.profilePhoto} alt={dog.name} />
                                    <a href={`/dogs/${dog.id}`}><DogName>{dog.name}</DogName></a>
                                    <ButtonContainer>
                                        <Button onClick={() => handleEdit(dog.id)}>Edit</Button>
                                        <Button onClick={() => handleDelete(dog.id)}>Delete</Button>
                                    </ButtonContainer>
                                </DogCard>
                            ))}
                        </ListContainer>
                    ) : (
                        <div>No results found. Please adjust your filters and try again.</div>
                    )}
                    <PaginationWrapper>
                        <Pagination
                            totalItems={totalCount}
                            currentPage={page}
                            itemsPerPage={pageSize}
                            onPageChange={handlePageChange}
                        />
                    </PaginationWrapper>
                </>
            )}
            <GlobalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {modalContent}
            </GlobalModal>
        </ListWrapper>
    );
};

export default AdminDogList;