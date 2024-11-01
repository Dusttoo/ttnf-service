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

const PreviewContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid ${theme.colors.primary};
  cursor: pointer;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${theme.colors.error};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 20px;
  height: 20px;
  font-size: 12px;
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
    singleImageMode?: boolean; 
}

const ImageUpload: React.FC<ImageUploadProps> = ({ maxImages, onImagesChange, initialImages = [], singleImageMode = false }) => {
    const [imageUrls, setImageUrls] = useState<string[]>(initialImages);

    useEffect(() => {
        if (initialImages.length) {
            setImageUrls(initialImages);
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
            
            const newImageUrls = singleImageMode ? uploadedUrls : [...imageUrls, ...uploadedUrls];
            setImageUrls(newImageUrls);
            onImagesChange(newImageUrls);
        } else {
            alert(`You can upload up to ${maxImages} images.`);
        }
    };

    const handleReplaceImage = () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
    };

    const handleRemoveImage = (event: React.MouseEvent, index: number) => {
        event.stopPropagation(); 
        event.preventDefault();
        const updatedUrls = [...imageUrls];
        updatedUrls.splice(index, 1);
        setImageUrls(updatedUrls);
        onImagesChange(updatedUrls);
    };

    return (
        <UploadContainer>
            <UploadLabel>
                {imageUrls.length < maxImages ? (
                    <>
                        <HiddenInput
                            type="file"
                            multiple={!singleImageMode}
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
                    <PreviewContainer key={index}>
                        <PreviewImage
                            src={image}
                            alt={`Preview ${index + 1}`}
                            onClick={() => singleImageMode && handleReplaceImage()}
                        />
                        {!singleImageMode && (
                            <RemoveButton onClick={(event) => handleRemoveImage(event, index)}>×</RemoveButton>
                        )}
                    </PreviewContainer>
                ))}
            </ImagePreview>
        </UploadContainer>
    );
};

export default ImageUpload;