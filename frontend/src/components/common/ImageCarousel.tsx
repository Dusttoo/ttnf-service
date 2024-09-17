import React from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  width: 80%;
  margin: 2rem auto;

  .slick-prev, .slick-next {
    z-index: 1;
  }

  .slick-prev:before, .slick-next:before {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const CarouselImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

interface ImageCarouselProps {
    images: { id: number; src: string; alt: string }[];
    settings?: any;
  }


  const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, settings }) => {
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
        <CarouselContainer>
          <Slider {...carouselSettings}>
            {images.map((image) => (
              <div key={image.id}>
                <CarouselImage src={image.src} alt={image.alt} />
              </div>
            ))}
          </Slider>
        </CarouselContainer>
      );
    };

    export default ImageCarousel;