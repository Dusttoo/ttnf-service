import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import styled from 'styled-components';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import { Page } from '../../../../../api/types/page';
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
  padding: 1rem;
`;

const CarouselImagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
`;

const SortableItem = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props) =>
    props.isDragging
      ? props.theme.colors.secondary
      : props.theme.colors.secondaryBackground};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: grab;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
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
  onSaveCarousel: (
    carouselSpeed: number,
    updatedCarouselImages: CarouselImageType[]
  ) => void;
  isInsideParent?: boolean;
  isSidebarOpen: boolean;
}

const CarouselEdit: React.FC<CarouselEditProps> = ({
  page,
  onSaveCarousel,
  isSidebarOpen,
  isInsideParent = false,
}) => {
  const [carouselImages, setCarouselImages] = useState<CarouselImageType[]>([]);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [carouselSpeed, setCarouselSpeed] = useState(3000);

  // Initialize carousel images from the page prop
  useEffect(() => {
    if (carouselImages.length === 0) {
      if (page.customValues?.carouselImages) {
        setCarouselImages(
          page.customValues.carouselImages.map(
            (image: CarouselImageType, index: number) => ({
              ...image,
              id: image.id || `carousel-image-${index}`, // Ensure id is string or number
            })
          )
        );
      } else if (page.carousel) {
        setCarouselImages(
          page.carousel.map((image: CarouselImageType, index: number) => ({
            id: `carousel-image-${index}`, // Assign unique string IDs
            src: image.src, // Access src from CarouselImageType
            alt: image.alt || `Carousel Image ${index + 1}`, // Use existing alt or default
          }))
        );
      } else if (page.customValues?.heroContent?.carouselImages) {
        setCarouselImages(
          page.customValues.heroContent.carouselImages.map(
            (image: CarouselImageType, index: number) => ({
              ...image,
              id: image.id || `hero-carousel-image-${index}`,
            })
          )
        );
      }
    }
  }, [page, carouselImages.length]);

  // Handle responsive layout if needed (currently using column direction)
  useEffect(() => {
    const updateLayout = () => {
      // Placeholder for any responsive logic if needed
    };

    window.addEventListener('resize', updateLayout);
    updateLayout();

    return () => window.removeEventListener('resize', updateLayout);
  }, [isSidebarOpen]);

  // Initialize dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = carouselImages.findIndex(
        (image) => image.id === active.id
      );
      const newIndex = carouselImages.findIndex(
        (image) => image.id === over?.id
      );

      const newImages = arrayMove(carouselImages, oldIndex, newIndex);
      setCarouselImages(newImages);
      onSaveCarousel(carouselSpeed, newImages);
    }
  };

  // Handle image upload
  const handleImageUpload = (urls: string[]) => {
    const newImages = urls.map((url, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      src: url,
      alt: `Uploaded Image ${index + 1}`,
    }));

    const updatedImages = [...carouselImages, ...newImages].slice(0, 10); // Ensure max 10 images
    setCarouselImages(updatedImages);
    onSaveCarousel(carouselSpeed, updatedImages);
  };

  // Handle carousel speed change
  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(e.target.value);
    setCarouselSpeed(newSpeed);
    onSaveCarousel(newSpeed, carouselImages);
  };

  // Handle removing an image
  const handleRemoveImage = (id: string | number) => {
    const updatedImages = carouselImages.filter((image) => image.id !== id);
    setCarouselImages(updatedImages);
    onSaveCarousel(carouselSpeed, updatedImages);
  };

  // Handle alt text change
  const handleAltTextChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => {
    const newImages = carouselImages.map((image) =>
      image.id === id ? { ...image, alt: e.target.value } : image
    );
    setCarouselImages(newImages);
    onSaveCarousel(carouselSpeed, newImages);
  };

  return (
    <CarouselEditContainer ref={contentAreaRef}>
      <h3>Edit Carousel</h3>
      <Input
        type="number"
        value={carouselSpeed.toString()}
        onChange={handleSpeedChange}
        width="150px"
        label="Carousel Speed (ms)"
        placeholder="3000"
      />
      <ImageUpload
        maxImages={10 - carouselImages.length}
        onImagesChange={handleImageUpload}
        initialImages={carouselImages.map((img) => img.src)}
        singleImageMode={false}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={carouselImages.map((image) => image.id)}
          strategy={verticalListSortingStrategy}
        >
          <CarouselImagesContainer>
            {carouselImages.map((image) => (
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

      {isInsideParent && (
        <SaveButton
          onClick={() => onSaveCarousel(carouselSpeed, carouselImages)}
        >
          Save Carousel
        </SaveButton>
      )}
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
