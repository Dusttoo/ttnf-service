import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button<{ active?: boolean }>`
  background-color: ${(props) => (props.active ? props.theme.colors.primary : props.theme.colors.secondaryBackground)};
  color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.text)};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  margin: 0 0.25rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.secondaryBackground};
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  margin-left: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryLight};
    color: ${(props) => props.theme.colors.white};
  }
`;

interface PaginationProps {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    itemsPerPageOptions?: number[];
    onPageChange: (page: number, itemsPerPage: number) => void;
    scrollToTop?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
    totalItems,
    currentPage,
    itemsPerPage,
    itemsPerPageOptions = [5, 10, 15, 20, 100],
    scrollToTop = true,
    onPageChange,
}) => {
    const [totalPages, setTotalPages] = useState(Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
    }, [totalItems, itemsPerPage]);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            onPageChange(pageNumber, itemsPerPage);
            if (scrollToTop) {
                window.scrollTo(0, 0);
            }
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = Number(e.target.value);
        onPageChange(1, newItemsPerPage);
    };

    return (
        <PaginationContainer>
            <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                &laquo;
            </PageButton>
            {[...Array(totalPages)].map((_, index) => (
                <PageButton
                    key={index}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                >
                    {index + 1}
                </PageButton>
            ))}
            <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                &raquo;
            </PageButton>
            <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                        {option} per page
                    </option>
                ))}
            </Select>
        </PaginationContainer>
    );
};

export default Pagination;