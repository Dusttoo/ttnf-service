import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PuppyCreate } from '../../../../../api/types/breeding';
import { GenderEnum, StatusEnum } from '../../../../../api/types/core';
import ImageUpload from '../../../../common/ImageUpload';
import { StatusBadge } from '../../../../common/StatusBadge';
import Button from '../../../../common/form/Button';
import FieldFeedback from '../../../../common/form/FieldFeedback';
import DateInput from '../../../../common/form/DateInput';
import ParentSelector from '../../../../common/form/ParentSelector';
import { getStatusColor } from '../../../../../utils/dogUtils';
import ImageUploadContainer from '../../../../common/ImageUploadContainer';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Darker background for dark theme
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  font-family: ${(props) => props.theme.fonts.secondary};
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.white}; // White for readability
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Darker background
  color: ${(props) => props.theme.colors.white}; // White text
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Darker background
  color: ${(props) => props.theme.colors.white}; // White text
  border-radius: 4px;
  font-size: 1rem;
`;

const DropdownButton = styled.button`
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Darker background
  color: ${(props) => props.theme.colors.white}; // White text
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:hover {
    background-color: ${(props) =>
      props.theme.colors.primary}; // Highlight on hover
    color: ${(props) => props.theme.colors.white};
  }
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: ${(props) =>
    props.theme.colors.secondaryBackground}; // Darker background
  border-radius: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  z-index: 1;
  width: 100%;
`;

const FilterLabel = styled.label`
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.colors.white}; // White text
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  accent-color: ${(props) => props.theme.colors.primary};
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1rem;
`;

const Label = styled.label`
  margin-right: 0.5rem;
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.2rem;
  margin-top: 1rem;
`;

interface PuppyFormProps {
  onClose: () => void;
  title?: string;
  defaultValues?: Partial<PuppyCreate>;
  onPuppyCreated?: (puppy: PuppyCreate) => void;
  onNextStep: () => void;
  litterData: {
    breedingId?: number;
    birthDate?: string;
    numberOfPuppies?: number;
    pedigreeUrl: string;
    parentMaleId?: number;
    parentFemaleId?: number;
  };
  isPartOfMultiStep?: boolean;
}

const PuppyForm: React.FC<PuppyFormProps> = ({
  onClose,
  title = 'Add New Puppy',
  defaultValues = {},
  onPuppyCreated,
  litterData,
  isPartOfMultiStep = false,
}) => {
  const [formState, setFormState] = useState<PuppyCreate>({
    name: '',
    dob: litterData.birthDate ?? '',
    gender: '' as GenderEnum,
    statuses: [],
    color: '',
    description: '',
    profilePhoto: '',
    parentMaleId: litterData.parentMaleId,
    parentFemaleId: litterData.parentFemaleId,
    healthInfos: [],
    pedigreeLink: litterData.pedigreeUrl,
    ...defaultValues,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableStatuses = Object.values(StatusEnum);

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      dob: litterData.birthDate ?? '',
      parentMaleId: litterData.parentMaleId,
      parentFemaleId: litterData.parentFemaleId,
      pedigreeLink: litterData.pedigreeUrl,
    }));
  }, [defaultValues, litterData]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormState = { ...formState, [name]: value };
    setFormState(updatedFormState);
  };

  const handleProfilePhotoChange = async (url: string) => {
    const updatedFormState = { ...formState, profilePhoto: url };
    setFormState(updatedFormState);
  };

  const handleGalleryChange = (urls: string[]) => {
    setGalleryPhotos(urls);
  };

  const handleStatusChange = (status: StatusEnum | undefined) => {
    setFormState((prevState) => ({ ...prevState, status }));
    setShowDropdown(false);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.name) newErrors.name = 'Name is required.';
    if (!formState.dob) newErrors.dob = 'Date of Birth is required.';
    if (!formState.gender) newErrors.gender = 'Gender is required.';
    if (!formState.statuses) newErrors.status = 'Status is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && onPuppyCreated) {
      onPuppyCreated({ ...formState });
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      formRef.current &&
      !formRef.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      onClose();
    } else if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <FormContainer ref={formRef}>
      <FormTitle>{title}</FormTitle>
      <form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Name"
          />
          {errors.name && <FieldFeedback message={errors.name} />}
        </InputGroup>
        <InputGroup>
          <DateInput
            label="Date of Birth"
            selectedDate={formState.dob ? new Date(formState.dob) : null}
            onChange={(date) =>
              setFormState({
                ...formState,
                dob: date ? date.toISOString() : '',
              })
            }
          />
          {errors.dob && <FieldFeedback message={errors.dob} />}
        </InputGroup>
        <InputGroup>
          <Input
            type="text"
            name="color"
            value={formState.color}
            onChange={handleChange}
            placeholder="Color"
          />
        </InputGroup>
        <InputGroup>
          <Input
            type="text"
            name="description"
            value={formState.description}
            onChange={handleChange}
            placeholder="Description"
          />
        </InputGroup>
        <InputGroup>
          <Dropdown
            name="gender"
            value={formState.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value={GenderEnum.Male}>{GenderEnum.Male}</option>
            <option value={GenderEnum.Female}>{GenderEnum.Female}</option>
          </Dropdown>
          {errors.gender && <FieldFeedback message={errors.gender} />}
        </InputGroup>
        <InputGroup ref={dropdownRef}>
          <DropdownButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowDropdown(!showDropdown);
            }}
          >
            {formState.statuses?.map((status) => (
              <StatusBadge color={getStatusColor(status)}>{status}</StatusBadge>
            ))}
            <span>&#9660;</span>
          </DropdownButton>
          <DropdownContent
            show={showDropdown}
            onClick={(e) => e.stopPropagation()}
          >
                    <>
          <FilterLabel>Status</FilterLabel>
          <CheckboxContainer>
            {Object.values(StatusEnum).map((status) => (
              <CheckboxContainer key={status}>
                <Label>{status}</Label>
                <Checkbox
                  checked={
                    formState.statuses
                      ? formState.statuses.includes(status)
                      : false
                  }
                  onChange={() => handleStatusChange(status)}
                />
              </CheckboxContainer>
            ))}
          </CheckboxContainer>
        </>
          </DropdownContent>
          {errors.status && <FieldFeedback message={errors.status} />}
        </InputGroup>
        <ParentSelector
          sireId={formState.parentMaleId}
          damId={formState.parentFemaleId}
          onSireChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              parentMaleId: Number(e.target.value),
            }))
          }
          onDamChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              parentFemaleId: Number(e.target.value),
            }))
          }
        />
       <SectionTitle>Photos</SectionTitle>
        <ImageUploadContainer
          profilePhoto={formState.profilePhoto}
          onProfilePhotoChange={handleProfilePhotoChange}
          galleryPhotos={galleryPhotos}
          onGalleryPhotosChange={handleGalleryChange}
        />
        <SubmitContainer>
          {!isPartOfMultiStep && (
            <>
              <Button type="submit">Save</Button>
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </SubmitContainer>
      </form>
    </FormContainer>
  );
};

export default PuppyForm;
