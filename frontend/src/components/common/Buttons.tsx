import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faEdit,
  faTrash,
  faEye,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

interface IconButtonProps {
  icon: IconDefinition;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  hoverColor?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  title?: string;
}

const StyledButton = styled.button<Partial<IconButtonProps>>`
  background-color: ${(props) => props.backgroundColor || 'transparent'};
  color: ${(props) => props.color || props.theme.colors.primary};
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  margin: 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;

  &:hover {
    background-color: ${(props) =>
      props.hoverBackgroundColor || props.theme.colors.primary};
    color: ${(props) => props.hoverColor || 'white'};
  }
`;

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  color,
  hoverColor,
  backgroundColor,
  hoverBackgroundColor,
  disabled = false,
  title = '',
}) => (
  <StyledButton
    disabled={disabled}
    onClick={onClick}
    color={color}
    hoverColor={hoverColor}
    backgroundColor={backgroundColor}
    hoverBackgroundColor={hoverBackgroundColor}
    title={title}
  >
    <FontAwesomeIcon icon={icon} />
  </StyledButton>
);

export const EditButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <IconButton icon={faEdit} onClick={onClick} title="Edit" />
);

export const ViewButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <IconButton icon={faEye} onClick={onClick} title="View" />
);

export const AddButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <IconButton icon={faPlus} onClick={onClick} title="Add" />
);

export const DeleteButton: React.FC<{ onClick?: () => void }> = ({
  onClick,
}) => (
  <IconButton
    icon={faTrash}
    onClick={onClick}
    color="#ff4d4f"
    hoverBackgroundColor="#ff4d4f"
    title="Delete"
  />
);
