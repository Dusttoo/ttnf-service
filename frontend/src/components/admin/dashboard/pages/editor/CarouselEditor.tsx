import React, { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import ImageUpload from '../../../../common/ImageUpload';
import Input from '../../../../common/Input';

const CarouselEditContainer = styled.div`
  padding: 0.5rem;
`;

const CarouselImagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  max-height: 300px;
  overflow-y: auto;
  box-sizing: border-box;
`;

const SortableItem = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem; /* Reduced padding */
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props) =>
    props.isDragging
      ? props.theme.colors.secondary
      : props.theme.colors.secondaryBackground};
  cursor: grab;
  gap: 0.5rem; /* Compact gap between elements */
`;

const ImageThumbnail = styled.img`
  width: 60px; /* Smaller thumbnail */
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 0.5rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const SaveButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 0.8rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

interface CarouselEditProps {
  carouselImages: CarouselImageType[];
  carouselSpeed: number;
  onSaveCarousel: (
    carouselSpeed: number,
    updatedCarouselImages: CarouselImageType[]
  ) => void;
}

const CarouselEdit: React.FC<CarouselEditProps> = ({
  carouselImages,
  carouselSpeed,
  onSaveCarousel,
}) => {
  const [images, setImages] = useState<CarouselImageType[]>(carouselImages);
  const [speed, setSpeed] = useState<number>(carouselSpeed);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setImages(carouselImages);
    setSpeed(carouselSpeed);
  }, [carouselImages, carouselSpeed]);

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
      const oldIndex = images.findIndex((image) => image.id === active.id);
      const newIndex = images.findIndex((image) => image.id === over?.id);
      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      setImages(reorderedImages);
      onSaveCarousel(speed, reorderedImages);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    const newImages = urls.map((url, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      src: url,
      alt: `Uploaded Image ${index + 1}`,
    }));
    const updatedImages = [...images, ...newImages].slice(0, 10);
    setImages(updatedImages);
    onSaveCarousel(speed, updatedImages); 
  };

  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(e.target.value);
    setSpeed(newSpeed);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onSaveCarousel(newSpeed, images);
    }, 600); 
  };
  
  const handleRemoveImage = (id: string | number) => {
    const updatedImages = images.filter((image) => image.id !== id);
    setImages(updatedImages);
    onSaveCarousel(speed, updatedImages); 
  };

  const handleAltTextChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => {
    const updatedImages = images.map((image) =>
      image.id === id ? { ...image, alt: e.target.value } : image
    );
    setImages(updatedImages);
    onSaveCarousel(speed, updatedImages); 
  };


  const handleSave = () => {
    onSaveCarousel(speed, images);
  };

  return (
    <CarouselEditContainer>
    <h3>Edit Carousel</h3>
    <Input
      type="number"
      value={speed.toString()}
      onChange={handleSpeedChange}
      width="150px"
      label="Carousel Speed (ms)"
      placeholder="3000"
    />
    <ImageUpload
      id="carousel-upload"
      maxImages={10 - images.length}
      onImagesChange={handleImageUpload}
      initialImages={images.map((img) => img.src)}
      singleImageMode={false}
    />
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((image) => image.id)}
        strategy={verticalListSortingStrategy}
      >
        <CarouselImagesContainer>
          {images.map((image) => (
            <SortableCarouselImage
              key={image.id}
              id={image.id}
              image={image}
              handleRemoveImage={handleRemoveImage}
              handleAltTextChange={handleAltTextChange}
            />
          ))}
        </CarouselImagesContainer>
      </SortableContext>
    </DndContext>
  </CarouselEditContainer>
  );
};

export default CarouselEdit;

interface SortableCarouselImageProps {
  id: string | number;
  image: CarouselImageType;
  handleRemoveImage: (id: string | number) => void;
  handleAltTextChange: (
    e: ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => void;
}

const SortableCarouselImage: React.FC<SortableCarouselImageProps> = ({
  id,
  image,
  handleRemoveImage,
  handleAltTextChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SortableItem
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <FontAwesomeIcon
        icon={faGripVertical}
        style={{ cursor: 'grab', marginRight: '1rem' }}
      />
      <ImageThumbnail src={image.src} alt={image.alt} />
      <Input
        type="text"
        value={image.alt}
        onChange={(e) => handleAltTextChange(e, id)}
        placeholder="Alt Text"
        label="Alt Text"
        style={{ flex: 1, marginRight: '1rem' }}
      />
      <ControlsContainer>
        <FontAwesomeIcon
          icon={faTrashAlt}
          onClick={() => handleRemoveImage(id)}
          style={{ color: 'red', cursor: 'pointer' }}
          title="Remove Image"
        />
      </ControlsContainer>
    </SortableItem>
  );
};
