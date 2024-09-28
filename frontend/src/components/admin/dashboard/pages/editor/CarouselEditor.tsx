import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import styled from 'styled-components';
import { CarouselImage as CarouselImageType } from '../../../../../api/types/core';
import { Page } from '../../../../../api/types/page';
import {
  faArrowUp,
  faArrowDown,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';
import { IconButton, DeleteButton } from '../../../../common/Buttons';
import Input from '../../../../common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ImageUpload from '../../../../common/ImageUpload';

const CarouselEditContainer = styled.div`
  padding: 1rem;
`;

const CarouselImagesContainer = styled.div<{ isColumn: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.isColumn ? 'column' : 'row')};
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 8px;
  flex-wrap: wrap;
`;

const ImageWrapper = styled.div<{ isColumn: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
  flex-direction: ${(props) => (props.isColumn ? 'column' : 'row')};

  /* Responsive layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ImagePreview = styled.div<{ isColumn: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: ${(props) => (props.isColumn ? '0' : '5px')};
  flex-direction: ${(props) => (props.isColumn ? 'column' : 'row')};
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
`;

const ControlsContainer = styled.div<{ isColumn: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.isColumn ? 'row' : 'column')};
  justify-content: ${(props) => (props.isColumn ? 'space-between' : 'center')};
  align-items: center;
  gap: 0.5rem;
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
  onSaveCarousel: (carouselSpeed: number, updatedCarouselImages: CarouselImageType[]) => void;
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
  const [isColumnLayout, setIsColumnLayout] = useState(true);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [carouselSpeed, setCarouselSpeed] = useState(3000);

  useEffect(() => {
    if (page.customValues?.carouselImages && carouselImages.length === 0) {
      setCarouselImages(
        page.customValues.carouselImages.map(
          (image: CarouselImageType, index: number) => ({
            ...image,
            id: image.id || index,
          })
        )
      );
    } else if (page.carousel && carouselImages.length === 0) {
      setCarouselImages(
        page.carousel.map((image, index) => ({
          ...image,
          id: image.id || index,
        }))
      );
    } else if (page.customValues?.heroContent?.carouselImages && carouselImages.length === 0) {
      setCarouselImages(
        page.customValues.heroContent.carouselImages.map(
          (image: CarouselImageType, index: number) => ({
            ...image,
            id: image.id || index,
          })
        )
      );
    }
  }, [page, carouselImages.length]);

  useEffect(() => {
    const updateLayout = () => {
      const contentAreaWidth = contentAreaRef.current?.offsetWidth || 0;
      setIsColumnLayout(contentAreaWidth < 578);
    };

    window.addEventListener('resize', updateLayout);
    updateLayout();

    return () => window.removeEventListener('resize', updateLayout);
  }, [isSidebarOpen]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...carouselImages];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setCarouselImages(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === carouselImages.length - 1) return;
    const newImages = [...carouselImages];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setCarouselImages(newImages);
  };

  const handleImageUpload = (urls: string[]) => {
    const newImages = urls.map((url, index) => ({
      id: Date.now() + index,
      src: url,
      alt: `Uploaded Image ${index + 1}`,
    }));

    setCarouselImages((prevImages) => {
      const existingUrls = prevImages.map((img) => img.src);
      const nonDuplicateImages = newImages.filter(
        (img) => !existingUrls.includes(img.src)
      );
      return [...prevImages, ...nonDuplicateImages];
    });

    // Call onSaveCarousel to immediately update the parent
    onSaveCarousel(carouselSpeed, [...carouselImages, ...newImages]);
  };

  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number(e.target.value);
    setCarouselSpeed(newSpeed);

    // Immediately propagate the speed change to the parent
    onSaveCarousel(newSpeed, carouselImages);
  };

  const handlePositionChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newPosition = parseInt(e.target.value, 10) - 1;
    if (newPosition >= 0 && newPosition < carouselImages.length) {
      const newImages = [...carouselImages];
      const [movedImage] = newImages.splice(index, 1);
      newImages.splice(newPosition, 0, movedImage);
      setCarouselImages(newImages);

      // Call onSaveCarousel to update the parent immediately
      onSaveCarousel(carouselSpeed, newImages);
    }
  };

  const handleRemoveImage = (id: number) => {
    const updatedImages = carouselImages.filter((image) => image.id !== id);
    setCarouselImages(updatedImages);

    // Call onSaveCarousel to update the parent immediately
    onSaveCarousel(carouselSpeed, updatedImages);
  };

  return (
    <CarouselEditContainer ref={contentAreaRef}>
      <h3>Edit Carousel</h3>
      <Input
        type="number"
        value={carouselSpeed.toString()}
        onChange={handleSpeedChange}
        width="100px"
        label="Carousel Speed (ms)"
        placeholder="3000"
      />
      <ImageUpload
        maxImages={10}
        onImagesChange={handleImageUpload}
        initialImages={carouselImages.map((img) => img.src)}
      />

      <CarouselImagesContainer isColumn={isColumnLayout}>
        {carouselImages.map((image, index) => (
          <ImageWrapper key={image.id} isColumn={isColumnLayout}>
            <div>
              <Input
                type="number"
                value={(index + 1).toString()}
                onChange={(e) => handlePositionChange(e, index)}
                width="50px"
                label="Position"
              />
            </div>
            <ImagePreview isColumn={isColumnLayout}>
              <ImageThumbnail src={image.src} alt={image.alt} />
              <div>
                <Input
                  type="text"
                  value={image.alt}
                  onChange={(e) => handlePositionChange(e, index)}
                  placeholder="Alt Text"
                  label="Alt Text"
                />
              </div>
            </ImagePreview>

            <ControlsContainer isColumn={isColumnLayout}>
              <IconButton
                icon={faArrowUp}
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Move up"
              />
              <DeleteButton onClick={() => handleRemoveImage(image.id)} />
              <IconButton
                icon={faArrowDown}
                onClick={() => handleMoveDown(index)}
                disabled={index === carouselImages.length - 1}
                title="Move down"
              />
            </ControlsContainer>
          </ImageWrapper>
        ))}
      </CarouselImagesContainer>
    </CarouselEditContainer>
  );
};

export default CarouselEdit;
