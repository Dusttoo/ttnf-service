import React from 'react';
import { Dog } from '../../../../api/types/dog';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TableSortLabel } from '@mui/material';
import { StatusBadge } from '../../../common/StatusBadge';
import { getStatusColor } from '../../../../utils/dogUtils';

interface DogTableProps {
  dogs: Dog[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DogTable: React.FC<DogTableProps> = ({ dogs, onEdit, onDelete }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dogs.map((dog) => (
            <TableRow key={dog.id}>
              <TableCell>{dog.name}</TableCell>
              <TableCell>{dog.gender}</TableCell>
              <TableCell>{dog.color}</TableCell>
              <TableCell>
                {dog?.statuses ? dog.statuses.map((status) => (
                  <StatusBadge key={status} color={getStatusColor(status)}>
                    {status}
                  </StatusBadge>
                )) : "No active status"}
              </TableCell>
              <TableCell>
                <button onClick={() => onEdit(dog.id)}>Edit</button>
                <button onClick={() => onDelete(dog.id)}>Delete</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DogTable;