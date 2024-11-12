import React from 'react';
import styled from 'styled-components';
import { IconButton } from '../../../../common/Buttons';
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons';

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  position: fixed;
  top: 0;
  width: calc(100% - 300px);
  z-index: 10;
  padding-right: 350px;
`;

const LastSavedText = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textMuted};
`;

const SaveButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${(props) =>
    props.isActive
      ? props.theme.colors.primary
      : props.theme.colors.secondaryBackground};
  color: ${(props) => (props.isActive ? '#fff' : props.theme.colors.text)};
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.isActive ? 'pointer' : 'default')};
  opacity: ${(props) => (props.isActive ? 1 : 0.6)};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

interface ToolbarProps {
  lastSaved: string;
  isSaveActive: boolean;
  previewMode: boolean;
  onSave: () => void;
  togglePreviewMode: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  lastSaved,
  isSaveActive,
  previewMode,
  onSave,
  togglePreviewMode,
}) => {
  const getLastSavedText = () => {
    if (!lastSaved) return 'N/A';

    const savedDate = new Date(lastSaved);
    const now = new Date();
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    console.log('lastSaved', lastSaved, 'now: ', nowUTC);

    const diffInMinutes = Math.floor(
      (nowUTC.getTime() - savedDate.getTime()) / 60000
    );

    if (diffInMinutes < 1) {
      return 'Last saved just now';
    } else if (diffInMinutes < 60) {
      return `Last saved: ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else {
      return `Last saved: ${savedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} at ${savedDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
  };

  return (
    <ToolbarContainer>
      <LastSavedText>{getLastSavedText()}</LastSavedText>
      <ButtonContainer>
        <IconButton
          icon={previewMode ? faEdit : faEye}
          onClick={togglePreviewMode}
          hoverBackgroundColor={previewMode ? 'primaryDark' : 'secondary'}
          title={previewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
        />
        <SaveButton
          isActive={isSaveActive}
          onClick={isSaveActive ? onSave : undefined}
        >
          Save
        </SaveButton>
      </ButtonContainer>
    </ToolbarContainer>
  );
};

export default Toolbar;
