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
    console.log('handleDragEnd', active, over);
    setActiveId(null);

    if (!over || !active.id) return;

    const activeId = active.id as string;

    const activeContainer = Object.keys(containers).find((key) =>
      containers[key as keyof ContainersState].includes(activeId)
    );

    const overContainer =
      over.id === 'profile' || over.id === 'gallery'
        ? over.id 
        : Object.keys(containers).find((key) =>
            containers[key as keyof ContainersState].includes(over.id as string)
          ); 

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const items = [...containers[activeContainer as keyof ContainersState]];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedItems = arrayMove(items, oldIndex, newIndex);
        setContainers((prev) => ({
          ...prev,
          [activeContainer]: updatedItems,
        }));

        if (activeContainer === 'gallery') {
          onGalleryPhotosChange(updatedItems);
        }
      }
    } else {
      const activeItems = containers[
        activeContainer as keyof ContainersState
      ].filter((item) => item !== activeId);
      const overItems = [
        ...containers[overContainer as keyof ContainersState],
        activeId,
      ];

      setContainers((prev) => ({
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }));

      if (overContainer === 'profile') {
        onProfilePhotoChange(activeId);
      }
      if (overContainer === 'gallery') {
        onGalleryPhotosChange(overItems);
      }
    }
  };

  const handleDelete = (id: string, containerId: string): void => {
    setContainers((prev) => {
      const updatedItems = prev[containerId as keyof ContainersState].filter(
        (item) => item !== id
      );

      if (containerId === 'profile') {
        onProfilePhotoChange('');
      }
      if (containerId === 'gallery') {
        onGalleryPhotosChange(updatedItems);
      }

      return {
        ...prev,
        [containerId]: updatedItems,
      };
    });
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    const containerId = event.target.getAttribute('data-container-id');
    if (!files || !containerId) return;

    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const response = await uploadImage(file, 'dogs', file.name, 'image');
        if (
          !containers[containerId as keyof ContainersState].includes(
            response.url
          )
        ) {
          uploadedUrls.push(response.url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setContainers((prev) => {
      const updatedItems = [
        ...prev[containerId as keyof ContainersState],
        ...uploadedUrls,
      ];
      if (containerId === 'profile') {
        onProfilePhotoChange(uploadedUrls[0]);
        return { ...prev, profile: [uploadedUrls[0]] };
      } else {
        onGalleryPhotosChange(updatedItems);
        return { ...prev, gallery: updatedItems.slice(0, 50) };
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
            onDelete={(id) => handleDelete(id, containerId)} // Pass delete logic
          />
        ))}
      </ContainerWrapper>
      <DragOverlay>
        {activeId && (
          <div style={{ width: '100px', height: '100px' }}>
            <img
              src={activeId}
              alt="Drag Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #E76F00',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default ImageUploadContainer;
