import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DroppableContainer from './DroppableContainer';
import SortableImage from './SortableImage';
import styled from 'styled-components';

const ContainerWrapper = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

interface ImageUploadContainerProps {
  profilePhoto?: string;
  onProfilePhotoChange: (url: string) => void;
  galleryPhotos: string[];
  onGalleryPhotosChange: (urls: string[]) => void;
}

const ImageUploadContainer: React.FC<ImageUploadContainerProps> = ({
  profilePhoto,
  onProfilePhotoChange,
  galleryPhotos,
  onGalleryPhotosChange,
}) => {
  const [containers, setContainers] = useState({
    profile: profilePhoto ? [profilePhoto] : [],
    gallery: [...galleryPhotos],
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync with props when profilePhoto or galleryPhotos change
  useEffect(() => {
    setContainers({
      profile: profilePhoto ? [profilePhoto] : [],
      gallery: [...galleryPhotos],
    });
  }, [profilePhoto, galleryPhotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = Object.keys(containers).find((key) =>
      containers[key].includes(active.id)
    );
    const overContainer = Object.keys(containers).find((key) =>
      containers[key].includes(over.id)
    );

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reordering within the same container
      const items = [...containers[activeContainer]];
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedItems = arrayMove(items, oldIndex, newIndex);
        setContainers((prev) => ({
          ...prev,
          [activeContainer]: updatedItems,
        }));
        if (activeContainer === 'gallery') onGalleryPhotosChange(updatedItems);
      }
    } else {
      // Moving between containers
      const activeItems = containers[activeContainer].filter(
        (item) => item !== active.id
      );
      const overItems = [...containers[overContainer], active.id];

      setContainers((prev) => ({
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }));

      // Update callbacks
      if (activeContainer === 'profile') {
        onProfilePhotoChange('');
      }
      if (overContainer === 'profile') {
        onProfilePhotoChange(active.id);
      }

      if (activeContainer === 'gallery') {
        onGalleryPhotosChange(activeItems);
      }
      if (overContainer === 'gallery') {
        onGalleryPhotosChange(overItems);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
    >
      <ContainerWrapper>
        {Object.keys(containers).map((containerId) => (
          <DroppableContainer
            key={containerId}
            id={containerId}
            items={containers[containerId]}
          />
        ))}
      </ContainerWrapper>
      <DragOverlay>
        {activeId && (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #E76F00',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#4A4A4A',
            }}
          >
            <img
              src={activeId}
              alt="Drag Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default ImageUploadContainer;