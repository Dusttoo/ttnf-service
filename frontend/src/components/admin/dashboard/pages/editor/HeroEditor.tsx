import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../../../common/Button';
import ImageCarousel from '../../../../common/ImageCarousel';

const HeroEditContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const CTAButton = styled(Button)`
  margin-top: 1rem;
`;

const HeroEdit: React.FC = ({page: Page}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [introductionText, setIntroductionText] = useState('');
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    // Load existing content from page or API if needed
  }, []);

  const handleSave = () => {
    // Handle save logic here (e.g., update API)
  };

  return (
    <HeroEditContainer>
      <h3>Edit Hero Section</h3>

      <label>Title</label>
      <InputField
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter hero title"
      />

      <label>Description</label>
      <TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter hero description"
      />

      <label>Call-to-Action Text</label>
      <InputField
        type="text"
        value={ctaText}
        onChange={(e) => setCtaText(e.target.value)}
        placeholder="Enter CTA text"
      />

      <label>Introduction Text</label>
      <TextArea
        value={introductionText}
        onChange={(e) => setIntroductionText(e.target.value)}
        placeholder="Enter introduction text"
      />

      {/* Display existing carousel and add option to edit later */}
      <label>Hero Carousel</label>
      <ImageCarousel images={carouselImages} width="300px" settings={{ autoplay: true }} />
      {/* In the future, add a carousel edit interface here */}

      <CTAButton variant="primary" onClick={handleSave}>Save Hero Section</CTAButton>
    </HeroEditContainer>
  );
};

export default HeroEdit;