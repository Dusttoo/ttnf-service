import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import { DeleteButton } from '../../../../common/Buttons';
import { Page } from '../../../../../api/types/page';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
} from 'react-beautiful-dnd';

const CarouselEditContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CarouselImagesContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 2rem;
  border-radius: 8px;
  flex-wrap: wrap;

  /* Hide scrollbars */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ImagePreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: transform 0.2s;
  flex-shrink: 0;
  max-width: 150px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ImageThumbnail = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const ImageText = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
`;

//const DeleteButton = styled.button`
//  background-color: ${(props) => props.theme.colors.error};
//  border: none;
//  color: white;
//  padding: 0.25rem 0.75rem;
//  border-radius: 50%;
//  cursor: pointer;
//  transition: background-color 0.2s;
//
//  &:hover {
//    background-color: ${(props) => props.theme.colors.errorDark};
//  }
//
//  &::before {
//    content: '✖'; /* You can use an icon library for better icons */
//  }
//`;

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
}

const CarouselEdit: React.FC<CarouselEditProps> = ({
  page,
  onSaveCarousel,
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
    onSaveCarousel(carouselImages); // Pass the updated carousel images
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
                      <span>{image.alt}</span>
                      <DeleteButton
                        onClick={() => handleRemoveImage(image.id)}
                      />
                    </ImagePreview>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </CarouselImagesContainer>
          )}
        </Droppable>
      </DragDropContext>

      <SaveButton onClick={handleSave}>Save Carousel</SaveButton>
    </CarouselEditContainer>
  );
};

export default CarouselEdit;
