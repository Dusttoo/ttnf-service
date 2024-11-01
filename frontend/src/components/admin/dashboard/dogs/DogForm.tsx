import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GenderEnum, StatusEnum } from '../../../../api/types/core';
import { DogCreate, DogUpdate } from '../../../../api/types/dog';
import { uploadImage } from '../../../../api/imageApi';
import Button from '../../../common/form/Button';
import ParentSelector from '../../../common/form/ParentSelector';
import ImageUpload from '../../../common/ImageUpload';
import FieldFeedback from '../../../common/form/FieldFeedback';
import { useDog } from '../../../../hooks/useDog';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Dark background
  border-radius: 8px;
  color: ${(props) => props.theme.colors.white}; // Light text color
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.2rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${(props) =>
    props.theme.colors.neutralBackground}; // Darker input background
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.white}; // Light text color
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.5rem;
  background-color: ${(props) =>
    props.theme.colors.neutralBackground}; // Darker dropdown background
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  color: ${(props) => props.theme.colors.white}; // Light text color
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;


interface DogFormProps {
  onClose: () => void;
  dogId?: number;
  title?: string;
  redirect?: string;
  defaultValues?: Partial<DogCreate>;
  onDogCreated?: (dog: DogCreate) => void;
}

const DogForm: React.FC<DogFormProps> = ({
  onClose,
  dogId,
  title = 'Add New Dog',
  redirect,
  defaultValues = {},
  onDogCreated,
}) => {
  const navigate = useNavigate();
  const { data: dog } = useDog(Number(dogId));

  const [formState, setFormState] = useState<DogCreate | DogUpdate>({
    name: '',
    dob: '',
    gender: '' as GenderEnum,
    status: undefined,
    color: '',
    description: '',
    profilePhoto: '',
    parentMaleId: undefined,
    parentFemaleId: undefined,
    healthInfos: [],
    ...defaultValues,
  });

  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; gender?: string }>({});

  useEffect(() => {
    if (dog) {
      setFormState({
        ...dog,
        gender: dog.gender as GenderEnum,
        status: dog.status as StatusEnum,
        parentMaleId: dog.parentMaleId,
        parentFemaleId: dog.parentFemaleId,
      });
      setProfilePhoto(dog.profilePhoto || null);
      setGalleryPhotos(dog.photos.map((photo) => photo.photoUrl));
    }
  }, [dogId]);

  const handleProfilePhotoChange = (urls: string[]) => {
    setProfilePhoto(urls[0] || null);
  };

  const validate = () => {
    const newErrors: { name?: string; gender?: string } = {};
    if (!formState.name) newErrors.name = 'Name is required.';
    if (!formState.gender) newErrors.gender = 'Gender is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Process form data
    try {
      const updatedFormState = {
        ...formState,
        profilePhoto: profilePhoto || '',
        photos: galleryPhotos.map((url) => ({
          photo_url: url,
          alt: `${formState.name}'s photo`,
        })),
      };

      if (dogId) {
        // Update dog logic
      } else {
        if (onDogCreated) onDogCreated(updatedFormState as DogCreate);
        else {
          // Create new dog
        }
      }
      onClose();
      if (redirect) navigate(redirect);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <FormContainer>
      <h1>{title}</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          placeholder="Name"
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        />
        {errors.name && <FieldFeedback message={errors.name} />}

        <Input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formState.dob}
          onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
        />

        <Dropdown
          name="gender"
          value={formState.gender}
          onChange={(e) =>
            setFormState({ ...formState, gender: e.target.value as GenderEnum })
          }
        >
          <option value="">Select Gender</option>
          <option value={GenderEnum.Male}>Male</option>
          <option value={GenderEnum.Female}>Female</option>
        </Dropdown>
        {errors.gender && <FieldFeedback message={errors.gender} />}

        <Input
          type="text"
          name="color"
          placeholder="Color"
          value={formState.color}
          onChange={(e) =>
            setFormState({ ...formState, color: e.target.value })
          }
        />

        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={formState.description}
          onChange={(e) =>
            setFormState({ ...formState, description: e.target.value })
          }
        />

        <ParentSelector
          sireId={formState.parentMaleId}
          damId={formState.parentFemaleId}
          onSireChange={(e) =>
            setFormState({
              ...formState,
              parentMaleId: parseInt(e.target.value, 10) || undefined,
            })
          }
          onDamChange={(e) =>
            setFormState({
              ...formState,
              parentFemaleId: parseInt(e.target.value, 10) || undefined,
            })
          }
        />

        <SectionTitle>Profile Photo</SectionTitle>
        <ImageUpload
          maxImages={1}
          onImagesChange={handleProfilePhotoChange}
          initialImages={profilePhoto ? [profilePhoto] : []}
        />

        {/* Gallery Photos */}
        <SectionTitle>Gallery Photos</SectionTitle>
        <ImageUpload
          maxImages={50}
          onImagesChange={setGalleryPhotos}
          initialImages={galleryPhotos}
        />
        <ButtonContainer>
          <Button $variant="primary" type="submit">
            Save
          </Button>
          <Button $variant="error" type="button" onClick={onClose}>
            Cancel
          </Button>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default DogForm;
