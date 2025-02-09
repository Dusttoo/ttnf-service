import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GenderEnum, StatusEnum } from '../../../../api/types/core';
import { DogCreate, DogUpdate } from '../../../../api/types/dog';
import { useDog } from '../../../../hooks/useDog';
import Button from '../../../common/form/Button';
import CharacterCounter from '../../../common/form/CharacterCounter';
import Checkbox from '../../../common/form/Checkbox';
import FieldFeedback from '../../../common/form/FieldFeedback';
import ParentSelector from '../../../common/form/ParentSelector';
import ImageUploadContainer from '../../../common/ImageUploadContainer';

const MAX_DESCRIPTION_LENGTH = 2500;

interface errorInputs {
  [key: string]: string;
}

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

const Section = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`;

const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const Label = styled.label`
  margin-right: 0.5rem;
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

interface DogFormProps {
  onClose: () => void;
  dogId?: number;
  title?: string;
  redirect?: string;
  defaultValues?: Partial<DogCreate>;
  onDogCreated?: (dog: DogCreate) => void;
  onDogUpdated?: (dog: DogUpdate) => void;
  showStatus?: boolean;
}

// Import statements remain the same...

const DogForm: React.FC<DogFormProps> = ({
  onClose,
  dogId,
  title = 'Add New Dog',
  redirect,
  defaultValues = {},
  onDogCreated,
  onDogUpdated,
  showStatus = true,
}) => {
  const navigate = useNavigate();
  const { data: dog } = useDog(Number(dogId));
  const isFormInitialized = useRef(false);

  const [formState, setFormState] = useState({
    name: '',
    dob: '',
    gender: '' as GenderEnum,
    statuses: [],
    color: '',
    description: '',
    profilePhoto: '',
    studFee: undefined,
    saleFee: undefined,
    pedigreeLink: '',
    isRetired: false,
    isProduction: false,
    parentMaleId: undefined,
    parentFemaleId: undefined,
    healthInfos: [],
    galleryPhotos: [],
    ...defaultValues,
  });
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<errorInputs>({});

  const handleStatusChange = (status: StatusEnum) => {
    setFormState((prevState) => {
      const updatedStatuses = prevState.statuses ? [...prevState.statuses] : [];

      if (updatedStatuses.includes(status)) {
        const newStatuses = updatedStatuses.filter((s) => s !== status);
        return {
          ...prevState,
          statuses: newStatuses,
          isRetired:
            status === StatusEnum.Retired ? false : prevState.isRetired,
          isProduction:
            status === StatusEnum.Production ? false : prevState.isProduction,
        };
      } else {
        return {
          ...prevState,
          statuses: [...updatedStatuses, status],
          isRetired: status === StatusEnum.Retired ? true : prevState.isRetired,
          isProduction:
            status === StatusEnum.Production ? true : prevState.isProduction,
        };
      }
    });
  };

  useEffect(() => {
    if (dog && !isFormInitialized.current) {
      setFormState((prev) => ({
        ...prev,
        ...dog,
        statuses: dog.statuses ?? [],
        pedigreeLink: prev.pedigreeLink || dog.pedigreeLink || '',
      }));
      const sortedGalleryPhotos = dog.photos
        .filter((photo) => photo.photoUrl !== dog.profilePhoto)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((photo) => photo.photoUrl);

      setGalleryPhotos(sortedGalleryPhotos);

      isFormInitialized.current = true;
    }
  }, [dog]);

  const handleProfilePhotoChange = (url: string) => {
    setFormState({ ...formState, profilePhoto: url });
  };

  const handleGalleryPhotosChange = (urls: string[]) => {
    setGalleryPhotos(urls);
  };

  const validate = () => {
    const newErrors: errorInputs = {};
    if (!formState.name) newErrors.name = 'Name is required.';
    if (!formState.gender) newErrors.gender = 'Gender is required.';
    if (!formState.dob) newErrors.dob = 'Date of Birth is required.';
    if (formState.studFee !== undefined && formState.studFee < 0) newErrors.studFee = 'Stud fee must be positive.';
    if (formState.saleFee !== undefined && formState.saleFee < 0) newErrors.saleFee = 'Sale fee must be positive.';
    if (formState.pedigreeLink && !/^https?:\/\/.+$/.test(formState.pedigreeLink)) newErrors.pedigreeLink = 'Invalid URL';
    if (formState.description.length > 2500) newErrors.description = 'Description cannot exceed 2500 characters.';
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
        {/* Name Field */}
        <Input
          type="text"
          name="name"
          placeholder="Name"
          value={formState.name}
          required
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        />
        {errors.name && <FieldFeedback message={errors.name} />}

        {/* Date of Birth Field */}
        <Input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formState.dob}
          onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
        />
        {errors.dob && <FieldFeedback message={errors.dob} />}


        {/* Gender Dropdown */}
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

        {/* Status Dropdown */}
        {showStatus && (
          <Section>
            <SectionTitle>Status</SectionTitle>
            <CheckboxContainer>
              {Object.values(StatusEnum).map((status) => (
                <SelectContainer key={status}>
                  <Label>{status}</Label>
                  <Checkbox
                    checked={
                      formState.statuses
                        ? formState.statuses.includes(status)
                        : false
                    }
                    onChange={() => handleStatusChange(status)}
                  />
                </SelectContainer>
              ))}
            </CheckboxContainer>
          </Section>
        )}

        {/* Color Field */}
        <Input
          type="text"
          name="color"
          placeholder="Color"
          value={formState.color}
          onChange={(e) =>
            setFormState({ ...formState, color: e.target.value })
          }
        />
        {errors.color && <FieldFeedback message={errors.color} />}


        {/* Description Field */}
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={formState.description}
          onChange={(e) =>
            setFormState({ ...formState, description: e.target.value })
          }
        />
        <CharacterCounter currentLength={formState.description.length} maxLength={MAX_DESCRIPTION_LENGTH} />
        {errors.description && <FieldFeedback message={errors.description} />}


        {/* Stud Fee Field */}
        <Input
          type="number"
          name="studFee"
          placeholder="Stud Fee"
          value={dog?.studFee ? dog.studFee : formState.studFee || ''}
          onChange={(e) =>
            setFormState({
              ...formState,
              studFee: Number(e.target.value) || undefined,
            })
          }
        />
        {errors.studFee && <FieldFeedback message={errors.studFee} />}


        {/* Sale Fee Field */}
        <Input
          type="number"
          name="saleFee"
          placeholder="Sale Fee"
          value={dog?.saleFee ? dog.saleFee : formState.saleFee || ''}
          onChange={(e) =>
            setFormState({
              ...formState,
              saleFee: Number(e.target.value) || undefined,
            })
          }
        />
        {errors.saleFee && <FieldFeedback message={errors.saleFee} />}


        {/* Pedigree Link Field */}
        <Input
          type="url"
          name="pedigreeLink"
          placeholder="Pedigree Link"
          value={
            dog?.pedigreeLink ? dog.pedigreeLink : formState.pedigreeLink || ''
          }
          onChange={(e) =>
            setFormState({ ...formState, pedigreeLink: e.target.value })
          }
        />
        {errors.pedigreeLink && <FieldFeedback message={errors.pedigreeLink} />}


        {/* Retired Checkbox */}

        {/* Parent Selector */}
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

        {/* Profile Photo Upload */}
        <SectionTitle>Photos</SectionTitle>
        <ImageUploadContainer
          profilePhoto={formState.profilePhoto}
          onProfilePhotoChange={(url) =>
            setFormState({ ...formState, profilePhoto: url })
          }
          galleryPhotos={galleryPhotos}
          onGalleryPhotosChange={(urls) => setGalleryPhotos(urls)}
        />

        {/* Form Buttons */}
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
