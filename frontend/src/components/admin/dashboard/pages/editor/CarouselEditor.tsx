import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
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

const CarouselEditContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CarouselImagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border-radius: 8px;
`;

const ImageWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: 1rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const ImagePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 5px;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
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
  onSaveCarousel: (updatedCarouselImages: CarouselImageType[]) => void;
  isInsideParent?: boolean;
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
          id: image.id || index,
        }))
      );
    }
  }, [page]);

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, index) => ({
      id: Date.now() + index,
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

  const handlePositionChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newPosition = parseInt(e.target.value, 10) - 1;
    if (newPosition >= 0 && newPosition < carouselImages.length) {
      const newImages = [...carouselImages];
      const [movedImage] = newImages.splice(index, 1);
      newImages.splice(newPosition, 0, movedImage);
      setCarouselImages(newImages);
    }
  };

  const handleAltChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    setCarouselImages((prevImages) =>
      prevImages.map((img, idx) =>
        idx === index ? { ...img, alt: e.target.value } : img
      )
    );
  };

  const handleSave = () => {
    onSaveCarousel(carouselImages);
  };

  const handleRemoveImage = (id: number) => {
    setCarouselImages(carouselImages.filter((image) => image.id !== id));
  };

  return (
    <CarouselEditContainer>
      <h3>Edit Carousel</h3>

      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop images here, or click to select images</p>
      </div>

      <CarouselImagesContainer>
        {carouselImages.map((image, index) => (
          <ImageWrapper key={image.id}>
            <Input
              type="number"
              value={(index + 1).toString()}
              onChange={(e) => handlePositionChange(e, index)}
              width="40px"
            />
            <ImagePreview>
              <ImageThumbnail src={image.src} alt={image.alt} />
              <Input
                type="text"
                value={image.alt}
                onChange={(e) => handleAltChange(e, index)}
                placeholder="Alt Text"
              />
            </ImagePreview>

            <ControlsContainer>
              <IconButton
                icon={faArrowUp}
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              />
              <DeleteButton onClick={() => handleRemoveImage(image.id)} />

              <IconButton
                icon={faArrowDown}
                onClick={() => handleMoveDown(index)}
                disabled={index === carouselImages.length - 1}
              />
            </ControlsContainer>
          </ImageWrapper>
        ))}
      </CarouselImagesContainer>

      {!isInsideParent && (
        <SaveButton onClick={handleSave}>
          <FontAwesomeIcon icon={faFloppyDisk} />
        </SaveButton>
      )}
    </CarouselEditContainer>
  );
};

export default CarouselEdit;
