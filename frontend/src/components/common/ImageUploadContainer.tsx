import React from 'react';
import ImageUpload from './ImageUpload';

interface ImageUploadContainerProps {
  profilePhoto?: string;
  onProfilePhotoChange: (url: string) => void;
  galleryPhotos: string[];
  onGalleryPhotosChange: (urls: string[]) => void;
}

const ImageUploadContainer: React.FC<ImageUploadContainerProps> = ({
  profilePhoto,
  onProfilePhotoChange,
  galleryPhotos,
  onGalleryPhotosChange,
}) => {
  return (
    <div>
      <h3>Profile Photo</h3>
      <ImageUpload
        maxImages={1}
        onImagesChange={(urls) => onProfilePhotoChange(urls[0])}
        initialImages={profilePhoto ? [profilePhoto] : []}
        singleImageMode={true}
      />

      <h3>Gallery Photos</h3>
      <ImageUpload
        maxImages={50}
        onImagesChange={onGalleryPhotosChange}
        initialImages={galleryPhotos}
        singleImageMode={false}
      />
    </div>
  );
};

export default ImageUploadContainer;