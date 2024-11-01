import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { uploadImage } from '../../api/imageApi';
import { theme } from '../../theme/theme';
import ErrorComponent from './Error';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  border: 2px dashed ${theme.colors.primary};
  border-radius: 8px;
  background-color: ${theme.colors.secondaryBackground};
  cursor: pointer;
  &:hover {
    background-color: ${theme.colors.neutralBackground};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid ${theme.colors.primary};
`;

const UploadLabel = styled.label`
  font-family: ${theme.fonts.primary};
  font-size: 1rem;
  color: ${theme.colors.primary};
`;

interface ImageUploadProps {
    maxImages: number;
    onImagesChange: (urls: string[]) => void;
    initialImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ maxImages, onImagesChange, initialImages = [] }) => {
    const [imageUrls, setImageUrls] = useState<string[]>(initialImages);

    useEffect(() => {
        if (initialImages.length) {
            setImageUrls(initialImages);
            console.log("Initial images loaded: ", initialImages);
        }
    }, [initialImages]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        event.preventDefault();

        const files = event.target.files;
        if (files && files.length + imageUrls.length <= maxImages) {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const response = await uploadImage(file, "dogs", file.name, "image");
                    uploadedUrls.push(response.url);  
                } catch (error) {
                    return <ErrorComponent message={(error as Error).message} />;
                }
            }
            
            const newImageUrls = [...imageUrls, ...uploadedUrls];
            console.log("new urls: ",newImageUrls)
            setImageUrls(newImageUrls);

            onImagesChange(newImageUrls);
        } else {
            alert(`You can upload up to ${maxImages} images.`);
        }
    };

    return (
        <UploadContainer>
            <UploadLabel>
                {imageUrls.length < maxImages ? (
                    <>
                        <HiddenInput
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        Drag and Drop images here or <strong>Choose files</strong>
                    </>
                ) : (
                    <span>Maximum {maxImages} images uploaded</span>
                )}
            </UploadLabel>
            <ImagePreview>
                {imageUrls.map((image, index) => (
                    <PreviewImage key={index} src={image} alt={`Preview ${index + 1}`} />
                ))}
            </ImagePreview>
        </UploadContainer>
    );
};

export default ImageUpload;