import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { toggleEditMode } from '../../features/editModeSlice';
import { selectIsAuthenticated } from '../../features/authSlice';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #333;
  color: #fff;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
`;

const Button = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const AdminToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isEditMode = useSelector((state: RootState) => state.editMode.isEditMode);

  if (!isAuthenticated) return null;

  return (
    <ToolbarContainer>
      <div>Admin Toolbar</div>
      {isAuthenticated && (
        <Button onClick={() => dispatch(toggleEditMode())}>
          {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </Button>
      )}
    </ToolbarContainer>
  );
};

export default AdminToolbar;