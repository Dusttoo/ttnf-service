// src/pages/admin/ContactSubmissionsPage.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useContactSubmissions } from '../../hooks/useAdmin';
import { PaginatedResponse, ContactSubmission } from '../../api/types/admin';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th, td {
    padding: 0.75rem;
    border: 1px solid ${(props) => props.theme.colors.border};
    text-align: left;
  }

  th {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: ${(props) => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ContactSubmissionsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const { data, isLoading, isError, error, isFetching } = useContactSubmissions({ page, pageSize });

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const handlePrevious = () => {
    setPage((old) => Math.max(old - 1, 1));
  };

  const handleNext = () => {
    if (!data) return;
    setPage((old) => (old < totalPages ? old + 1 : old));
  };

  return (
    <PageContainer>
      <h2>Contact Submissions</h2>
      {isError ? (
        <p>Error: {error?.message || 'Failed to load contact submissions.'}</p>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((submission: ContactSubmission) => (
                <tr key={submission.id}>
                  <td>{submission.id}</td>
                  <td>{submission.name}</td>
                  <td>{submission.email || 'N/A'}</td>
                  <td>{submission.phone || 'N/A'}</td>
                  <td>{submission.message}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PaginationControls>
            <Button onClick={handlePrevious} disabled={page === 1 || isFetching}>
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={handleNext} disabled={page === totalPages || isFetching}>
              Next
            </Button>
          </PaginationControls>
        </>
      )}
    </PageContainer>
  );
};

export default ContactSubmissionsPage;