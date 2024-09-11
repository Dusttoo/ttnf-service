import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal, Pagination, Carousel } from 'react-bootstrap';
import { Photo } from '../../api/types/dog';

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
    const [showModal, setShowModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

    const totalPages = Math.ceil(images.length / imagesPerPage);

    const handleClick = (index: number) => {
        setCurrentImageIndex(index);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

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
            </GalleryContainer>
            <PaginationContainer>
                <Pagination>
                    {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                            key={i}
                            active={i + 1 === currentPage}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </PaginationContainer>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Body>
                    <Carousel activeIndex={currentImageIndex} onSelect={setCurrentImageIndex}>
                        {images.map((image, index) => (
                            <Carousel.Item key={index}>
                                <img className="d-block w-100" src={image.photoUrl} alt={`${image.alt}`} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ImageGallery;
