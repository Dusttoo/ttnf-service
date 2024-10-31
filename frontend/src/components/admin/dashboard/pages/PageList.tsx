import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPages, removePage } from '../../../../store/pageSlice';
import { RootState, AppDispatch } from '../../../../store';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorComponent from '../../../common/Error';
import { AddButton, EditButton, DeleteButton } from '../../../common/Buttons';
import { selectIsLoading } from '../../../../store/loadingSlice'; // Import the new loading selector

const PageListContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageItem = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1rem;
  margin: 0.75rem 0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};

  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const PageList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const { pages, error } = useSelector((state: RootState) => state.pages);
    const isLoading = useSelector(selectIsLoading); // Use selectIsLoading here

    useEffect(() => {
        dispatch(fetchPages());
    }, [dispatch]);

    const handleDelete = async (pageId: string) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            await dispatch(removePage(pageId));
        }
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
            </LoadingContainer>
        );
    }

    if (error) return <ErrorComponent message={error} />;

    return (
        <PageListContainer>
            <h2>Pages</h2>
            <AddButton onClick={() => navigate('/admin/dashboard/pages/new')} />

            {pages
                .filter((page) => !page.isLocked)
                .map((page) => (
                    <PageItem key={page.id}>
                        <PageTitle>{page.name}</PageTitle>
                        <ButtonContainer>
                            <EditButton
                                onClick={() =>
                                    navigate(`/admin/dashboard/pages/edit/${page.slug}`)
                                }
                            />
                            <DeleteButton onClick={() => handleDelete(page.id)} />
                        </ButtonContainer>
                    </PageItem>
                ))}
        </PageListContainer>
    );
};

export default PageList;