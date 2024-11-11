import React from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';

const CarouselContainer = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || '80%'};
  margin: 2rem auto;
  height: ${(props) => props.height || '500px'};

  .slick-prev, .slick-next {
    z-index: 1;
  }

  .slick-prev:before, .slick-next:before {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const CarouselSlide = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const CarouselImage = styled.img<{ height?: string }>`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

interface ImageCarouselProps {
    images: { id: number | string; src: string; alt: string }[];
    initialIndex?: number;
    settings?: any;
    width?: string;
    height?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, initialIndex = 0, settings, width, height }) => {
    const defaultSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        initialSlide: initialIndex,
    };

    const carouselSettings = { ...defaultSettings, ...settings };

    return (
        <CarouselContainer width={width} height={height}>
            <Slider {...carouselSettings}>
                {images.map((image) => (
                    <CarouselSlide key={image.id}>
                        <CarouselImage src={image.src} alt={image.alt} height={height} />
                    </CarouselSlide>
                ))}
            </Slider>
        </CarouselContainer>
    );
};

export default ImageCarousel;