import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableImage from './SortableImage';
import styled from 'styled-components';

const Container = styled.div<{ isOver: boolean }>`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 1rem;
  width: 250px;
  min-height: 150px;
  background-color: ${({ isOver, theme }) =>
    isOver ? theme.colors.neutralBackground : theme.colors.secondaryBackground};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.h4`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.secondary};
  margin-bottom: 1rem;
`;

interface DroppableContainerProps {
  id: string;
  items: string[];
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({ id, items }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Container ref={setNodeRef} isOver={isOver}>
      <Title>{id === 'profile' ? 'Profile Photo' : 'Gallery'}</Title>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {items.map((item) => (
            <SortableImage key={item} id={item} image={item} />
          ))}
        </div>
      </SortableContext>
    </Container>
  );
};

export default DroppableContainer;