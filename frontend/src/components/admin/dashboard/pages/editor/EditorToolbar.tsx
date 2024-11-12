import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
`;

const LastSavedText = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textMuted};
`;

const SaveButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${(props) => (props.isActive ? props.theme.colors.primary : props.theme.colors.secondaryBackground)};
  color: ${(props) => (props.isActive ? '#fff' : props.theme.colors.text)};
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.isActive ? 'pointer' : 'default')};
  opacity: ${(props) => (props.isActive ? 1 : 0.6)};
`;

interface ToolbarProps {
  lastSaved: string;
  isSaveActive: boolean;
  onSave: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ lastSaved, isSaveActive, onSave }) => (
  <ToolbarContainer>
    <LastSavedText>Last saved: {lastSaved}</LastSavedText>
    <SaveButton isActive={isSaveActive} onClick={isSaveActive ? onSave : undefined}>
      Save
    </SaveButton>
  </ToolbarContainer>
);

export default Toolbar;