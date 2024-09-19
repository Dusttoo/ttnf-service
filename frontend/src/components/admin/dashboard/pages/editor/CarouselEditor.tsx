import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import { Page } from '../../../../../api/types/page';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
} from 'react-beautiful-dnd';

// Styling for Carousel Edit Area
const CarouselEditContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CarouselImagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
  border-radius: 8px;
`;

const ImagePreview = styled.div`
  position: relative;
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  flex-shrink: 0;
  max-width: 150px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ImageThumbnail = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const ImageText = styled.input`
  width: calc(100% - 16px);
  padding: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  margin-top: 0.5rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const UploadArea = styled.div`
  padding: 2rem;
  border: 2px dashed ${(props) => props.theme.colors.border};
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
`;

const SaveButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

interface CarouselEditProps {
  page: Page;
  onSaveCarousel: (updatedCarouselImages: CarouselImageType[]) => void;
  isInsideParent?: boolean; // Optional prop to detect if inside a parent component
}

const CarouselEdit: React.FC<CarouselEditProps> = ({
  page,
  onSaveCarousel,
  isInsideParent = false,
}) => {
  const [carouselImages, setCarouselImages] = useState<CarouselImageType[]>([]);

  useEffect(() => {
    if (page.customValues?.carouselImages) {
      setCarouselImages(
        page.customValues.carouselImages.map(
          (image: CarouselImageType, index: number) => ({
            ...image,
            id: image.id || index,
          })
        )
      );
    } else if (page.carousel) {
      setCarouselImages(
        page.carousel.map((image, index) => ({
          ...image,
          id: image.id || index, // Ensure id is a number
        }))
      );
    }
  }, [page]);

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, index) => ({
      id: Date.now() + index, // Ensure id is a number
      src: URL.createObjectURL(file),
      alt: file.name,
    }));
    setCarouselImages((prevImages) => [...prevImages, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    onDrop,
  });

  const handleRemoveImage = (id: number) => {
    setCarouselImages(carouselImages.filter((image) => image.id !== id));
  };

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedImages = Array.from(carouselImages);
    const [reorderedItem] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, reorderedItem);
    setCarouselImages(reorderedImages);
  };

  const handleSave = () => {
    onSaveCarousel(carouselImages);
  };

  return (
    <CarouselEditContainer>
      <h3>Edit Carousel</h3>

      <UploadArea {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop images here, or click to select images</p>
      </UploadArea>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable
          droppableId="carousel-images-droppable"
          direction="horizontal"
        >
          {(provided: DroppableProvided) => (
            <CarouselImagesContainer
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {carouselImages.map((image, index) => (
                <Draggable
                  key={image.id.toString()} // Convert id to string for Draggable
                  draggableId={image.id.toString()} // Convert id to string for draggableId
                  index={index}
                >
                  {(provided: DraggableProvided) => (
                    <ImagePreview
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ImageThumbnail src={image.src} alt={image.alt} />
                      <ImageText
                        type="text"
                        value={image.alt}
                        onChange={(e) =>
                          setCarouselImages((prev) =>
                            prev.map((img, idx) =>
                              idx === index
                                ? { ...img, alt: e.target.value }
                                : img
                            )
                          )
                        }
                      />
                      <DeleteButton onClick={() => handleRemoveImage(image.id)}>
                        &times;
                      </DeleteButton>
                    </ImagePreview>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </CarouselImagesContainer>
          )}
        </Droppable>
      </DragDropContext>

      {/* Only show the Save button if it's standalone */}
      {!isInsideParent && (
        <SaveButton onClick={handleSave}>Save Carousel</SaveButton>
      )}
    </CarouselEditContainer>
  );
};

export default CarouselEdit;
