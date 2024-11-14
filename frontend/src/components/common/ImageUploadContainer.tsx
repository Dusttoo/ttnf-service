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
    console.log('handleDropToOther triggered with:', { url, targetId });

    if (targetId === 'gallery') {
      onProfilePhotoChange(url);
    } else if (targetId === 'profile') {
      if (profilePhoto === url) {
        onProfilePhotoChange('');
      }
      if (!galleryPhotos.includes(url)) {
        onGalleryPhotosChange([...galleryPhotos, url]);
      }
    }
  };

  return (
    <div>
      <h3>Profile Photo</h3>
      <ImageUpload
        id="profile" 
        maxImages={1}
        onImagesChange={(urls) => onProfilePhotoChange(urls[0])}
        initialImages={profilePhoto ? [profilePhoto] : []}
        singleImageMode={true}
        onDropToOther={handleDropToOther}
      />

      <h3>Gallery Photos</h3>
      <ImageUpload
        id="gallery" 
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