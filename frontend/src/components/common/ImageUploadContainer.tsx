import React, { useState, useEffect, useRef } from 'react';
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
import { uploadImage } from '../../api/imageApi';

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

interface ContainersState {
  profile: string[]; 
  gallery: string[]; 
}

const ImageUploadContainer: React.FC<ImageUploadContainerProps> = ({
  profilePhoto,
  onProfilePhotoChange,
  galleryPhotos,
  onGalleryPhotosChange,
}) => {
  const [containers, setContainers] = useState<ContainersState>({
    profile: profilePhoto ? [profilePhoto] : [],
    gallery: [...galleryPhotos],
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setContainers({
      profile: profilePhoto ? [profilePhoto] : [],
      gallery: [...galleryPhotos],
    });
  }, [profilePhoto, galleryPhotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.id || !over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = Object.keys(containers).find((key) =>
      containers[key as keyof ContainersState].includes(activeId)
    );
    const overContainer = Object.keys(containers).find((key) =>
      containers[key as keyof ContainersState].includes(overId)
    );

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reordering within the same container
      const items = [...containers[activeContainer as keyof ContainersState]];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);

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
      const activeItems = containers[activeContainer as keyof ContainersState].filter(
        (item) => item !== activeId
      );
      const overItems = [
        ...containers[overContainer as keyof ContainersState],
        activeId,
      ];

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
        onProfilePhotoChange(activeId);
      }

      if (activeContainer === 'gallery') {
        onGalleryPhotosChange(activeItems);
      }
      if (overContainer === 'gallery') {
        onGalleryPhotosChange(overItems);
      }
    }
  };

  const handleOpenFilePicker = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => async () => {
    console.log("target id", event.target);
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      try {
        const response = await uploadImage(file, 'dogs', file.name, 'image');
        uploadedUrls.push(response.url);

      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    const newImageUrls = event.target.id === 'profile'
    ? [uploadedUrls[0]]
    : [...galleryPhotos, ...uploadedUrls].slice(0, 50);

    if (event.target.id === 'profile') {
      onProfilePhotoChange(newImageUrls[0]);
    } else {
      onGalleryPhotosChange(newImageUrls);
    }

  if (fileInputRef.current) fileInputRef.current.value = '';}

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <ContainerWrapper>
        {Object.keys(containers).map((containerId) => (
          <DroppableContainer
            key={containerId}
            id={containerId}
            items={containers[containerId as keyof ContainersState]}
            inputFileRef={fileInputRef}
            onImageUpload={handleFileChange}
            handleOpenFilePicker={handleOpenFilePicker}
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