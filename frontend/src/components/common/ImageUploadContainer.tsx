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

  const handleDropToOther = (url: string, targetId: string) => {
    if (targetId === 'profile') {
      // Moving from gallery to profile
      onProfilePhotoChange(url);
      onGalleryPhotosChange(galleryPhotos.filter((photo) => photo !== url));
    } else if (targetId === 'gallery') {
      // Moving from profile to gallery
      if (profilePhoto === url) {
        onProfilePhotoChange('');
        onGalleryPhotosChange([...galleryPhotos, url]);
      }
    }
  };

  return (
    <div>
      <h3>Profile Photo</h3>
      <ImageUpload
        id="profile" // Unique identifier for the profile upload
        maxImages={1}
        onImagesChange={(urls) => onProfilePhotoChange(urls[0])}
        initialImages={profilePhoto ? [profilePhoto] : []}
        singleImageMode={true}
        onDropToOther={handleDropToOther}
      />

      <h3>Gallery Photos</h3>
      <ImageUpload
        id="gallery" // Unique identifier for the gallery upload
        maxImages={50}
        onImagesChange={onGalleryPhotosChange}
        initialImages={galleryPhotos}
        singleImageMode={false}
        onDropToOther={handleDropToOther}
      />
    </div>
  );
};

export default ImageUploadContainer;