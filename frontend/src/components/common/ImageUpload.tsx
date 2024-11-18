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
  box-sizing: border-box;
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
  display: inline-block;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid ${theme.colors.primary};
  cursor: pointer;
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

const UploadLabel = styled.label`
  font-family: ${theme.fonts.primary};
  font-size: 1rem;
  color: ${theme.colors.primary};
`;

const AddMoreButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.secondaryBackground};
  }
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();

    const files = event.target.files;
    if (files && files.length > 0) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const response = await uploadImage(file, 'dogs', file.name, 'image');
          uploadedUrls.push(response.url);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
      console.log('uploadedUrls', uploadedUrls);
      const newImageUrls = singleImageMode ? [uploadedUrls[0]] : [...imageUrls, ...uploadedUrls];
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);
      event.target.value = '';
    }
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    const updatedUrls = [...imageUrls];
    updatedUrls.splice(index, 1);
    setImageUrls(updatedUrls);
    onImagesChange(updatedUrls);
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDragStart = (image: string) => {
    console.log('handleDragStart', image);
    setDraggedImage(image);
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('handleDrop', e);
    e.preventDefault();
    if (draggedImage) {
      if (onDropToOther) {
        console.log('handleDrop', draggedImage, id);
        onDropToOther(draggedImage, id);
        console.log('handleDrop', imageUrls);
      }
      setDraggedImage(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('handleDragEnd', event);
    const { active, over } = event;

    if (!over) return;

    if (over.id !== id) {
      // Convert `over.id` to a string to ensure compatibility with the `onDropToOther` function
      if (over?.id && draggedImage && onDropToOther) {
        onDropToOther(draggedImage, id as string); // Call the cross-component drop handler with string `id`
      }
    } else if (active.id !== over.id) {
      // Handle reordering within the same component
      const oldIndex = imageUrls.findIndex((url) => url === active.id);
      const newIndex = imageUrls.findIndex((url) => url === over.id);
      const newImageUrls = arrayMove(imageUrls, oldIndex, newIndex);
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);
    }

    setDraggedImage(null); // Reset dragged image
};

  return (
    <UploadContainer
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={imageUrls.length < maxImages ? handleOpenFilePicker : undefined}
    >
      <HiddenInput
        ref={fileInputRef}
        id="file-upload"
        type="file"
        multiple={!singleImageMode}
        accept="image/*"
        onChange={handleFileChange}
      />
      <UploadLabel>
        {imageUrls.length < maxImages
          ? "Drag and Drop images here or Choose files"
          : "Max images reached"}
      </UploadLabel>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={imageUrls} strategy={horizontalListSortingStrategy}>
          <ImagePreview>
            {imageUrls.map((image, index) => (
              <SortableImage
                key={image}
                id={image}
                image={image}
                index={index}
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
  index: number;
  onRemove: () => void;
  onDragStart: () => void;
}

export const SortableImage: React.FC<SortableImageProps> = ({
  id,
  image,
  onRemove,
  onDragStart,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

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
      onDragStart={onDragStart}
      draggable
    >
      <PreviewImage src={image} alt="Preview" />
      <RemoveButton onClick={(event) => { event.stopPropagation(); onRemove(); }}>
        ×
      </RemoveButton>
    </PreviewContainer>
  );
};