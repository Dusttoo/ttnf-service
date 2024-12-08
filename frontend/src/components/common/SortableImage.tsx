import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

const StyledImage = styled.img`
  width: 100px;
  height: 100px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  object-fit: cover;
`;

const SortableImage: React.FC<{ id: string; image: string }> = ({ id, image }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <StyledImage src={image} alt="Sortable" />
    </div>
  );
};

export default SortableImage;