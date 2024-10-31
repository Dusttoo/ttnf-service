import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLitters, useDeleteLitter, useCreateLitter, useUpdateLitter } from '../../../../hooks/useLitter';
import Pagination from '../../../common/Pagination';
import LitterForm from './AddLitter/LitterForm';
import { Litter, LitterCreate, LitterUpdate } from '../../../../api/types/breeding';
import { useNavigate } from 'react-router-dom';
import { EditButton, ViewButton, DeleteButton } from '../../../common/Buttons';
import { sortByKey } from '../../../../utils/sort';
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

const LitterCard = styled.div`
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
  height: 400px;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0.5rem 0;
  }
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

const LitterInfo = styled.div`
  text-align: center;
  margin: 1rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 0.5rem;
`;

const AddNewLitterButton = styled.button`
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

const Title = styled.h1`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.colors.primary};
`;


const AdminLitterList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data, isLoading, isError, refetch } = useLitters(page, pageSize);
    const deleteLitterMutation = useDeleteLitter();
    const createLitterMutation = useCreateLitter();
    const updateLitterMutation = useUpdateLitter();
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();

    const handlePageChange = (newPage: number, newItemsPerPage: number) => {
        setPage(newPage);
        setPageSize(newItemsPerPage);
    };

    const handleEdit = (litterId: number) => {
        const litterToEdit = data?.items.find((litter: Litter) => litter.id === litterId);
        if (litterToEdit) {
            const initialValues: LitterUpdate = {
                birthDate: litterToEdit.birthDate,
                numberOfPuppies: litterToEdit.numberOfPuppies,
                breedingId: litterToEdit.breedingId,
            };
            openModal(
                <LitterForm
                    initialValues={initialValues}
                    onSubmit={async (litterData) => {
                        await updateLitterMutation.mutateAsync({
                            litterId: litterId,
                            litterData: litterData as LitterUpdate,
                        });
                        closeModal();
                        refetch();
                    }}
                    onCancel={closeModal}
                />,
            );
        }
    };

    const handleDelete = (litterId: number) => {
        if (window.confirm('Are you sure you want to delete this litter?')) {
            deleteLitterMutation.mutate(litterId, {
                onSuccess: () => {
                    refetch();
                },
            });
        }
    };

    const handleAddNewLitter = () => {
        const initialValues: LitterCreate = {
            birthDate: '',
            numberOfPuppies: 0,
            breedingId: 0,
        };
        openModal(
            <LitterForm
                initialValues={initialValues}
                onSubmit={async (litterData) => {
                    await createLitterMutation.mutateAsync(litterData as LitterCreate);
                    closeModal();
                    refetch();
                }}
                onCancel={closeModal}
            />,
        );
    };

    const handleViewPuppies = (litterId: number) => {
        navigate(`/admin/dashboard/litters/${litterId}/puppies`);
    };

    return (
        <ListWrapper>
            <AddNewLitterButton onClick={handleAddNewLitter}>Add New Litter</AddNewLitterButton>
            {isLoading ? (
                <LoadingSpinner />
            ) : isError ? (
                <ErrorComponent message="Error loading litters" />
            ) : (
                <>
                    {data && data.items.length > 0 ? (
                        <ListContainer>
                            {sortByKey<Litter>(data.items, 'birthDate', 'desc').map((litter) => (
                                <LitterCard key={litter.id}>
                                    <ImageContainer>
                                        <DogImage src={litter.breeding.femaleDog.profilePhoto}
                                                  alt={litter.breeding.femaleDog.name} />
                                        <DogImage
                                            src={
                                                litter.breeding.maleDog?.profilePhoto
                                                ?? litter.breeding.manualSireImageUrl
                                                ?? 'path/to/default-image.jpg'
                                            }
                                            alt={litter.breeding.maleDog?.name ?? litter.breeding.manualSireName ?? 'Unknown Male Dog'}
                                        />
                                    </ImageContainer>
                                    <LitterInfo>
                                        <Title>{litter.breeding.femaleDog.name} X {litter.breeding.maleDog?.name ?? litter.breeding.manualSireName ?? 'Unknown Sire'}</Title>
                                        <p>Birth Date: {litter.birthDate}</p>
                                        <p>Number of Puppies: {litter.numberOfPuppies}</p>
                                    </LitterInfo>
                                    <ButtonContainer>
                                        <EditButton onClick={() => handleEdit(litter.id)} />
                                        <ViewButton onClick={() => handleViewPuppies(litter.id)} />
                                        <DeleteButton onClick={() => handleDelete(litter.id)} />
                                    </ButtonContainer>
                                </LitterCard>
                            ))}
                        </ListContainer>
                    ) : (
                        <NoResults message={'No litters found.'} description={'Try adding a litter.'} />
                    )}
                    <PaginationWrapper>
                        {data?.totalCount !== undefined && (
                            <Pagination
                                totalItems={data.totalCount}
                                currentPage={page}
                                itemsPerPage={pageSize}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </PaginationWrapper>
                </>
            )}
            <GlobalModal />

        </ListWrapper>
    );
};

export default AdminLitterList;