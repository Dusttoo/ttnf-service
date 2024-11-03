// src/pages/admin/WaitlistSubmissionsPage.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useWaitlistSubmissions } from '../../hooks/useAdmin';
import { PaginatedResponse, WaitlistEntry } from '../../api/types/admin';

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

const WaitlistSubmissionsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const { data, isLoading, isError, error, isFetching } = useWaitlistSubmissions({ page, pageSize });

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
      <h2>Waitlist Submissions</h2>
      {isError ? (
        <p>Error: {error?.message || 'Failed to load waitlist submissions.'}</p>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender Preference</th>
                <th>Color Preference</th>
                <th>Additional Info</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((entry: WaitlistEntry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.name}</td>
                  <td>{entry.email || 'N/A'}</td>
                  <td>{entry.phone || 'N/A'}</td>
                  <td>{entry.gender_preference || 'N/A'}</td>
                  <td>{entry.color_preference || 'N/A'}</td>
                  <td>{entry.additional_info || 'N/A'}</td>
                  <td>{new Date().toLocaleString()}</td>
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

export default WaitlistSubmissionsPage;