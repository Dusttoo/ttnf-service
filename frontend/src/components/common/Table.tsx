import React from 'react';
import styled from 'styled-components';

export interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T;
}

interface TableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin: 1rem 0;
  padding: 0 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid ${(props) => props.theme.colors.primary};
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }

  tr:nth-child(even) {
    background-color: ${(props) => props.theme.colors.secondaryBackground};
  }

  tr:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

interface TableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
}

const ReusableTable = <T,>({ columns, data }: TableProps<T>) => {
  return (
    <TableContainer>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <>
                  {row[col.accessor] !== undefined ? (
                    <td key={colIndex}>{String(row[col.accessor])}</td>
                  ) : (
                    <td key={colIndex}>N/A</td>
                  )}
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableContainer>
  );
};

export default ReusableTable;
