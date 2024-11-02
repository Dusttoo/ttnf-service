import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GenderEnum, StatusEnum } from '../../../../api/types/core';
import { DogCreate, DogUpdate } from '../../../../api/types/dog';
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
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.white};
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.2rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.white};
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.5rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  color: ${(props) => props.theme.colors.white};
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
  onDogUpdated?: (dog: DogUpdate) => void;
}

const DogForm: React.FC<DogFormProps> = ({
  onClose,
  dogId,
  title = 'Add New Dog',
  redirect,
  defaultValues = {},
  onDogCreated,
  onDogUpdated,
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
    galleryPhotos: [],
    ...defaultValues,
  });

  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; gender?: string }>({});

  const isFormInitialized = useRef(false);

  useEffect(() => {
    if (dog && !isFormInitialized.current) {
      setFormState({
        ...formState,
        name: dog.name,
        dob: dog.dob,
        gender: dog.gender as GenderEnum,
        status: dog.status as StatusEnum,
        color: dog.color,
        description: dog.description,
        profilePhoto: dog.profilePhoto || '',
        parentMaleId: dog.parentMaleId,
        parentFemaleId: dog.parentFemaleId,
        healthInfos: dog.healthInfos,
      });
      const sortedGalleryPhotos = dog.photos
        .filter((photo) => photo.photoUrl !== dog.profilePhoto)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((photo) => photo.photoUrl);

      setGalleryPhotos(sortedGalleryPhotos);

      isFormInitialized.current = true;
    }
  }, [dog]);

  const handleProfilePhotoChange = (urls: string[]) => {
    setFormState({ ...formState, profilePhoto: urls[0] || '' });
  };

  const handleGalleryPhotosChange = (urls: string[]) => {
    setGalleryPhotos(urls);
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

    const updatedFormState = {
      ...formState,
      galleryPhotos,
    };

    if (dogId && onDogUpdated) {
      onDogUpdated(updatedFormState as DogUpdate);
    } else if (onDogCreated) {
      onDogCreated(updatedFormState as DogCreate);
    }
    onClose();
    if (redirect) navigate(redirect);
  };

  return (
    <FormContainer>
      <h1>{title}</h1>
      <Form onSubmit={handleSubmit}>
        {/* Form fields */}
        <Input
          type="text"
          name="name"
          placeholder="Name"
          value={formState.name}
          required
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
          key={formState.profilePhoto}
          maxImages={1}
          onImagesChange={handleProfilePhotoChange}
          initialImages={formState.profilePhoto ? [formState.profilePhoto] : []}
          singleImageMode={true}
        />

        <SectionTitle>Gallery Photos</SectionTitle>
        <ImageUpload
          maxImages={50}
          onImagesChange={handleGalleryPhotosChange}
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
