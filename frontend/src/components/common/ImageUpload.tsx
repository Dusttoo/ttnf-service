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
import ErrorComponent from './Error';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

interface ImageUploadProps {
  maxImages: number;
  onImagesChange: (urls: string[]) => void;
  initialImages?: string[];
  singleImageMode?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages,
  onImagesChange,
  initialImages = [],
  singleImageMode = false,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageUrls.length && initialImages.length) {
      console.log('Setting back to initial images');
      setImageUrls(initialImages);
    }
  }, [initialImages.length, imageUrls.length]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();

    const files = event.target.files;
    if (files && files.length > 0) {
      if (singleImageMode) {
        const file = files[0];
        try {
          const response = await uploadImage(file, 'dogs', file.name, 'image');
          const newImageUrls = [response.url];
          setImageUrls(newImageUrls);
          onImagesChange(newImageUrls);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      } else {
        if (files.length + imageUrls.length <= maxImages) {
          const uploadedUrls: string[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
              const response = await uploadImage(
                file,
                'dogs',
                file.name,
                'image'
              );
              uploadedUrls.push(response.url);
            } catch (error) {
              console.error('Error uploading image:', error);
            }
          }
          const newImageUrls = [...imageUrls, ...uploadedUrls];
          setImageUrls(newImageUrls);
          onImagesChange(newImageUrls);
        } else {
          alert(`You can upload up to ${maxImages} images.`);
        }
      }
      event.target.value = '';
    }
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedUrls = [...imageUrls];
    updatedUrls.splice(index, 1);
    setImageUrls(updatedUrls);
    onImagesChange(updatedUrls);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = imageUrls.findIndex((url) => url === active.id);
      const newIndex = imageUrls.findIndex((url) => url === over?.id);

      const newImageUrls = arrayMove(imageUrls, oldIndex, newIndex);
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);
    }
  };

  return (
    <UploadContainer>
      <UploadLabel htmlFor="file-upload">
        {(!singleImageMode && imageUrls.length < maxImages) ||
        (singleImageMode && imageUrls.length === 0) ? (
          <>
            <HiddenInput
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple={!singleImageMode}
              accept="image/*"
              onChange={handleFileChange}
            />
            Drag and Drop images here or <strong>Choose files</strong>
          </>
        ) : null}
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
                singleImageMode={singleImageMode}
                handleReplaceImage={handleReplaceImage}
                handleRemoveImage={handleRemoveImage}
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
    singleImageMode: boolean;
    handleReplaceImage: () => void;
    handleRemoveImage: (event: React.MouseEvent, index: number) => void;
  }
  
  export const SortableImage: React.FC<SortableImageProps> = ({
    id,
    image,
    index,
    singleImageMode,
    handleReplaceImage,
    handleRemoveImage,
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
      <PreviewContainer ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <PreviewImage
          src={image}
          alt={`Preview ${index + 1}`}
          onClick={singleImageMode ? handleReplaceImage : undefined}
        />
        <RemoveButton
          onClick={(event) => {
            event.stopPropagation();
            handleRemoveImage(event, index);
          }}
        >
          ×
        </RemoveButton>
      </PreviewContainer>
    );
  };
  
