import React, { useState } from 'react';
import styled from 'styled-components';
import { Photo } from '../../api/types/dog';
import ImageCarousel from './ImageCarousel';
import Pagination from './Pagination';
import NoResults from './NoResults';
import { useModal } from '../../context/ModalContext';

interface ImageGalleryProps {
    images: Photo[];
}

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 1rem;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [imagesPerPage] = useState(9);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { openModal, closeModal } = useModal();
    const carouselImages = images.map((image) => ({
        id: image.id,
        src: image.photoUrl,
        alt: image.alt,
    }));

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

    const totalPages = Math.ceil(images.length / imagesPerPage);

    const handleClick = (index: number) => {
        setCurrentImageIndex(index);
        openModal(<ImageCarousel images={carouselImages} initialIndex={index} />);
    };

    const handlePageChange = (page: number, newItemsPerPage: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            <GalleryContainer>
                {currentImages.map((image, index) => (
                    <Thumbnail
                        key={index}
                        src={image.photoUrl}
                        alt={`Thumbnail ${image.alt}`}
                        onClick={() => handleClick(index + indexOfFirstImage)}
                    />
                ))}
                {!images.length && (
                    <NoResults
                        message={'No images at the moment'}
                        description={'Please check back later for updated photos'}
                    />
                )}
            </GalleryContainer>
            {images.length > 0 && (
                <PaginationContainer>
                    <Pagination
                        totalItems={images.length}
                        currentPage={currentPage}
                        itemsPerPage={imagesPerPage}
                        onPageChange={handlePageChange}
                    />
                </PaginationContainer>
            )}
        </>
    );
};

export default ImageGallery;