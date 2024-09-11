import React from 'react';
import styled from 'styled-components';

const ToggleButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const ToggleButtonStyled = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
`;

interface ToggleButtonProps {
    isEditMode: boolean;
    onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isEditMode, onToggle }) => {
    return (
        <ToggleButtonContainer>
            <ToggleButtonStyled onClick={onToggle}>
                {isEditMode ? 'Preview' : 'Edit'}
            </ToggleButtonStyled>
        </ToggleButtonContainer>
    );
};

export default ToggleButton;