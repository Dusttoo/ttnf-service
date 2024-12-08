import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { uploadImage } from '../../api/imageApi';
import { theme } from '../../theme/theme';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  width: 100%;
  padding: 1rem;
  border: 2px dashed ${theme.colors.primary};
  border-radius: 8px;
  background-color: ${theme.colors.secondaryBackground};
  cursor: pointer;
  &:hover {
    background-color: ${theme.colors.neutralBackground};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const PreviewContainer = styled.div`
  position: relative;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid ${theme.colors.primary};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${theme.colors.error};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 20px;
  height: 20px;
  font-size: 12px;
`;

interface ImageUploadProps {
  id: string;
  maxImages: number;
  onImagesChange: (urls: string[]) => void;
  initialImages?: string[];
  singleImageMode?: boolean;
  onDropToOther?: (url: string, targetId: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  maxImages,
  onImagesChange,
  initialImages = [],
  singleImageMode = false,
  onDropToOther,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrls(initialImages);
  }, [initialImages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const newImageUrls = singleImageMode
      ? [uploadedUrls[0]]
      : [...imageUrls, ...uploadedUrls].slice(0, maxImages);

    setImageUrls(newImageUrls);
    onImagesChange(newImageUrls);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenFilePicker = () => {
    if (imageUrls.length < maxImages || singleImageMode) {
      fileInputRef.current?.click();
    }
  };

  const handleDragStart = (image: string) => {
    setDraggedImage(image);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (draggedImage && onDropToOther) {
      onDropToOther(draggedImage, id);
      setDraggedImage(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    onImagesChange(updatedUrls);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      const activeIndex = imageUrls.findIndex((url) => url === activeId);
      const overIndex = imageUrls.findIndex((url) => url === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const updatedUrls = arrayMove(imageUrls, activeIndex, overIndex);
        setImageUrls(updatedUrls);
        onImagesChange(updatedUrls);
      }
    }

    if (onDropToOther && over.id !== id) {
      // Cross-container drag
      onDropToOther(activeId, over.id as string);
    }

    setDraggedImage(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <UploadContainer
      onClick={handleOpenFilePicker}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <HiddenInput
        ref={fileInputRef}
        type="file"
        multiple={!singleImageMode}
        accept="image/*"
        onChange={handleFileChange}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={imageUrls} strategy={horizontalListSortingStrategy}>
          <ImagePreview>
            {imageUrls.map((image, index) => (
              <SortableImage
                key={image}
                id={image}
                image={image}
                onRemove={() => handleRemoveImage(index)}
                onDragStart={() => handleDragStart(image)}
              />
            ))}
          </ImagePreview>
        </SortableContext>
      </DndContext>
    </UploadContainer>
  );
};

export default ImageUpload;

interface SortableImageProps {
  id: string;
  image: string;
  onRemove: () => void;
  onDragStart: () => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ id, image, onRemove, onDragStart }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <PreviewContainer
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDragStart={() => onDragStart()}
      draggable
    >
      <PreviewImage src={image} alt="Preview" />
      <RemoveButton
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        ×
      </RemoveButton>
    </PreviewContainer>
  );
};