import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PuppyCreate} from '../../../../../api/types/breeding';
import { GenderEnum, StatusEnum } from '../../../../../api/types/core'
import ImageUpload from '../../../../common/ImageUpload';
import { StatusBadge } from '../../../../common/StatusBadge';
import Button from '../../../../common/form/Button';
import FieldFeedback from '../../../../common/form/FieldFeedback';
import DateInput from '../../../../common/form/DateInput';
import ParentSelector from '../../../../common/form/ParentSelector';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  font-family: ${(props) => props.theme.fonts.secondary};
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
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
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
`;

const DropdownButton = styled.button`
  background-color: ${(props) => props.theme.colors.white};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  z-index: 1;
  width: 100%;
`;

const FilterLabel = styled.label`
  margin-bottom: 0.5rem;
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
}

const PuppyForm: React.FC<PuppyFormProps> = ({
    onClose,
    title = 'Add New Puppy',
    defaultValues = {},
    onPuppyCreated,
    litterData,
}) => {
    const [formState, setFormState] = useState<PuppyCreate>({
        name: '',
        dob: litterData.birthDate ?? '',
        gender: '' as GenderEnum,
        status: StatusEnum.Available,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFormState = { ...formState, [name]: value };
        setFormState(updatedFormState);
    };

    const handleProfilePhotoChange = async (urls: string[]) => {
        const updatedFormState = { ...formState, profilePhoto: urls[0] };
        setFormState(updatedFormState);
    };

    const handleGalleryChange = (urls: string[]) => {
        setGalleryPhotos(urls);
    };

    const handleStatusChange = (status: StatusEnum) => {
        const updatedFormState = { ...formState, status };
        setFormState(updatedFormState);
        setShowDropdown(false);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formState.name) newErrors.name = 'Name is required.';
        if (!formState.dob) newErrors.dob = 'Date of Birth is required.';
        if (!formState.gender) newErrors.gender = 'Gender is required.';
        if (!formState.status) newErrors.status = 'Status is required.';
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
            formRef.current && !formRef.current.contains(event.target as Node) &&
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
        ) {
            onClose();
        } else if (
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
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
                        onChange={(date) => setFormState({ ...formState, dob: date ? date.toISOString() : '' })}
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
                    <DropdownButton onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowDropdown(!showDropdown); }}>
                        {formState.status ? (
                            <StatusBadge color="#E76F00">
                                {formState.status}
                                <span onClick={(e) => { e.stopPropagation(); setFormState((prevState) => ({ ...prevState, status: '' })); }}>
                                    &#x2715;
                                </span>
                            </StatusBadge>
                        ) : (
                            'Select Status'
                        )}
                        <span>&#9660;</span>
                    </DropdownButton>
                    <DropdownContent show={showDropdown} onClick={(e) => e.stopPropagation()}>
                        <FilterLabel>Status:</FilterLabel>
                        {availableStatuses.map((status) => (
                            <CheckboxContainer key={status}>
                                <Checkbox
                                    type="checkbox"
                                    value={status}
                                    checked={formState.status === status}
                                    onChange={() => handleStatusChange(status as StatusEnum)}
                                />
                                <FilterLabel>{status}</FilterLabel>
                            </CheckboxContainer>
                        ))}
                    </DropdownContent>
                    {errors.status && <FieldFeedback message={errors.status} />}
                </InputGroup>
                <ParentSelector
                    sireId={formState.parentMaleId}
                    damId={formState.parentFemaleId}
                    onSireChange={(e) => setFormState((prevState) => ({ ...prevState, parentMaleId: Number(e.target.value) }))}
                    onDamChange={(e) => setFormState((prevState) => ({ ...prevState, parentFemaleId: Number(e.target.value) }))}
                />
                <InputGroup>
                    <p>Select 1 profile image</p>
                    <ImageUpload maxImages={1} onImagesChange={handleProfilePhotoChange} initialImages={formState.profilePhoto ? [formState.profilePhoto] : []} />
                </InputGroup>
                <InputGroup>
                    <p>Select up to five gallery images</p>
                    <ImageUpload maxImages={5} onImagesChange={handleGalleryChange} initialImages={galleryPhotos} />
                </InputGroup>
                <SubmitContainer>
                    <Button type="submit">Save</Button>
                </SubmitContainer>
            </form>
        </FormContainer>
    );
}

export default PuppyForm;
