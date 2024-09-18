import React from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';

const CarouselContainer = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || '80%'};
  margin: 2rem auto;
  height: ${(props) => props.height || 'auto'};

  .slick-prev, .slick-next {
    z-index: 1;
  }

  .slick-prev:before, .slick-next:before {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const CarouselImage = styled.img<{ height?: string }>`
  width: 100%;
  height: ${(props) => props.height || 'auto'};
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

interface ImageCarouselProps {
  images: { id: number; src: string; alt: string }[];
  settings?: any;
  width?: string;
  height?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, settings, width, height }) => {
  const defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const carouselSettings = { ...defaultSettings, ...settings };

  return (
    <CarouselContainer width={width} height={height}>
      <Slider {...carouselSettings}>
        {images.map((image) => (
          <div key={image.id}>
            <CarouselImage src={image.src} alt={image.alt} height={height} />
          </div>
        ))}
      </Slider>
    </CarouselContainer>
  );
};

export default ImageCarousel;