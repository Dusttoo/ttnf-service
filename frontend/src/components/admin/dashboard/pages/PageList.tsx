import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPages, removePage } from '../../../../features/pageSlice';
import { RootState, AppDispatch } from '../../../../app/store';

const PageListContainer = styled.div`
  padding: 2rem;
`;

const PageItem = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.ui.button.primary.background};
  color: ${(props) => props.theme.ui.button.primary.color};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: red;
`;

const PageList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { pages, error } = useSelector((state: RootState) => state.pages);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  console.log('loading: ', isLoading)

  const handleDelete = async (pageId: number) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      await dispatch(removePage(pageId));
    }
  };

  if (isLoading) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  return (
    <PageListContainer>
      <h2>Pages</h2>
      <Button onClick={() => navigate('/admin/dashboard/pages/new')}>Create New Page</Button>
      {pages.map((page) => (
        <PageItem key={page.id}>
          <span>{page.title}</span>
          <div>
            <Button onClick={() => navigate(`/admin/dashboard/pages/edit/${page.slug}`)}>Edit</Button>
            <Button onClick={() => handleDelete(page.id)}>Delete</Button>
          </div>
        </PageItem>
      ))}
    </PageListContainer>
  );
};

export default PageList;