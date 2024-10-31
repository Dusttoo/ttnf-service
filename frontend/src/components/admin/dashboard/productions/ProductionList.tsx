import React, { useState } from 'react';
import styled from 'styled-components';
import { useProductions, useDeleteProduction } from '../../../../hooks/useProduction';
import Pagination from '../../../common/Pagination';
import ProductionForm from './ProductionForm';
import LoadingSpinner from '../../../common/LoadingSpinner';
import NoResults from '../../../common/NoResults';
import { Production } from '../../../../api/types/dog';
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

const ProductionCard = styled.div`
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

const ProductionImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductionName = styled.h3`
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

const AddNewProductionButton = styled.button`
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

const AdminProductionList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data, isLoading } = useProductions({}, page, pageSize);
    const deleteProduction = useDeleteProduction();
    const { openModal, closeModal } = useModal();
    console.log(openModal, closeModal);

    const handlePageChange = (newPage: number, newItemsPerPage: number) => {
        setPage(newPage);
        setPageSize(newItemsPerPage);
    };

    const handleEdit = (productionId: number) => {
        openModal(<ProductionForm onClose={closeModal} productionId={productionId} />);
    };

    const handleDelete = (productionId: number) => {
        if (window.confirm('Are you sure you want to delete this production?')) {
            deleteProduction.mutate(productionId);
        }
    };

    const handleAddNewProduction = () => {
        openModal(<ProductionForm onClose={closeModal} />);
    };

    return (
        <ListWrapper>
            <AddNewProductionButton onClick={handleAddNewProduction}>
                Add New Production
            </AddNewProductionButton>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {data && data?.items.length > 0 ? (
                        <ListContainer>
                            {data.items.map((production: Production) => (
                                <ProductionCard key={production.id}>
                                    <ProductionImage
                                        src={production.profilePhoto}
                                        alt={production.name}
                                    />
                                    <ProductionName>{production.name}</ProductionName>
                                    <ButtonContainer>
                                        <Button onClick={() => handleEdit(production.id)}>
                                            Edit
                                        </Button>
                                        <Button onClick={() => handleDelete(production.id)}>
                                            Delete
                                        </Button>
                                    </ButtonContainer>
                                </ProductionCard>
                            ))}
                        </ListContainer>
                    ) : (
                        <NoResults
                            message={'No productions found.'}
                            description={'Try adding a production'}
                        />
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

export default AdminProductionList;