import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

const ImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  object-fit: cover;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #d33a3a;
  }
`;

interface SortableImageProps {
  id: string;
  image: string;
  onDelete: (id: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ id, image, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  return (
    <ImageContainer
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <StyledImage src={image} alt="Sortable" />
      <DeleteButton
        onClick={(e) => {
          e.stopPropagation(); 
          onDelete(id);
        }}
      >
        ×
      </DeleteButton>
    </ImageContainer>
  );
};

export default React.memo(SortableImage);