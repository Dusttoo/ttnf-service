import React, { useState } from 'react';
import styled from 'styled-components';
import BreedingForm from './BreedingForm';
import MultiStepForm from '../litters/AddLitter/MultiStepForm';
import Pagination from '../../../common/Pagination';
import { Breeding, LitterCreate } from '../../../../api/types/breeding';
import { useBreedings, useDeleteBreeding } from '../../../../hooks/useBreeding';
import { useQueryClient } from 'react-query';
import { EditButton, AddButton, DeleteButton } from '../../../common/Buttons';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorComponent from '../../../common/Error';
import NoResults from '../../../common/NoResults';
import { useModal } from '../../../../context/ModalContext';
import GlobalModal from '../../../common/Modal';

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

const BreedingCard = styled.div`
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

const BreedingInfo = styled.div`
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

const AddNewBreedingButton = styled.button`
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

const ImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const DogImage = styled.img`
  width: 75px;
  height: 75px;
  border-radius: 20%;
  object-fit: cover;
  margin: 0.5rem;
`;

const Title = styled.h1`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.colors.primary};
`;

const AdminBreedingList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: breedingsData, isLoading, error } = useBreedings(page, pageSize);
    const { mutate: deleteBreeding } = useDeleteBreeding();
    const queryClient = useQueryClient();
    const { openModal, closeModal } = useModal();

    const handlePageChange = (newPage: number, newItemsPerPage: number) => {
        setPage(newPage);
        setPageSize(newItemsPerPage);
    };

    const handleEdit = (breedingId: number) => {
        openModal(<BreedingForm onClose={closeModal} breedingId={breedingId} />);
    };

    const handleDelete = (breedingId: number) => {
        if (window.confirm('Are you sure you want to delete this breeding?')) {
            deleteBreeding(breedingId, {
                onSuccess: () => {
                    queryClient.invalidateQueries('breedings');
                },
            });
        }
    };

    const handleAddNewBreeding = () => {
        openModal(<BreedingForm onClose={closeModal} />);
    };

    const handleCreateLitter = (breeding: Breeding) => {
        openModal(
            <MultiStepForm
                onClose={closeModal}
                breedingId={breeding.id}
                parentMaleId={breeding.maleDogId}
                parentFemaleId={breeding.femaleDogId}
            />,
        );
    };

    return (
        <ListWrapper>
            <AddNewBreedingButton onClick={handleAddNewBreeding}>Add New Breeding</AddNewBreedingButton>
            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorComponent message={`Error loading breedings: ${(error as Error).message}`} />
            ) : (
                <>
                    {breedingsData && breedingsData.items.length > 0 ? (
                        <ListContainer>
                            {breedingsData.items.map((breeding: Breeding) => (
                                <BreedingCard key={breeding.id}>
                                    <ImageContainer>
                                        <DogImage src={breeding.femaleDog.profilePhoto} alt={breeding.femaleDog.name} />
                                        <DogImage
                                            src={
                                                breeding.maleDog?.profilePhoto
                                                ?? breeding.manualSireImageUrl
                                                ?? 'path/to/default-image.jpg'
                                            }
                                            alt={breeding.maleDog?.name ?? breeding.manualSireName ?? 'Unknown Male Dog'}
                                        />
                                    </ImageContainer>
                                    <BreedingInfo>
                                        <Title>{breeding.femaleDog.name} X {breeding.maleDog?.name ?? breeding.manualSireName ?? 'Unknown Sire'}</Title>
                                        <p>Breeding Date: {breeding.breedingDate}</p>
                                        <p>Expected Birth Date: {breeding.expectedBirthDate}</p>
                                    </BreedingInfo>
                                    <ButtonContainer>
                                        <EditButton onClick={() => handleEdit(breeding.id)} />
                                        <DeleteButton onClick={() => handleDelete(breeding.id)} />
                                        <Button onClick={() => handleCreateLitter(breeding)}>Create Litter</Button>
                                    </ButtonContainer>
                                </BreedingCard>
                            ))}
                        </ListContainer>
                    ) : (
                        <NoResults message="No breedings found." description="Try adding a new breeding." />
                    )}
                    <PaginationWrapper>
                        <Pagination
                            totalItems={breedingsData?.total || 0}
                            currentPage={page}
                            itemsPerPage={pageSize}
                            onPageChange={handlePageChange}
                        />
                    </PaginationWrapper>
                </>
            )}
            <GlobalModal />
        </ListWrapper>
    );
};

export default AdminBreedingList;