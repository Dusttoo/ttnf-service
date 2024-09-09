import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GenderEnum, StatusEnum } from '../../../../api/types/core';
import { DogCreate, DogUpdate } from '../../../../api/types/dog'
import { uploadImage } from '../../../../api/imageApi';
import { StatusBadge } from '../../../common/StatusBadge';
import ImageUpload from '../../../common/ImageUpload';
import { useDog, useCreateDog, useUpdateDog } from '../../../../hooks/useDog';
import Button from '../../../common/form/Button';
import ParentSelector from '../../../common/form/ParentSelector';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
`;

const DropdownButton = styled.button`
  background-color: white;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 250px;
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  z-index: 1;
  width: 250px;
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
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
    redirect = '/admin/dashboard/dogs',
    defaultValues = {},
    onDogCreated,
}) => {
    const navigate = useNavigate();
    const { data: dog } = useDog(Number(dogId));
    const createDogMutation = useCreateDog();
    const updateDogMutation = useUpdateDog();

    const [formState, setFormState] = useState<DogCreate | DogUpdate>({
        name: '',
        dob: '',
        gender: '' as GenderEnum,
        status: '' as StatusEnum,
        color: '',
        description: '',
        profilePhoto: '',
        parentMaleId: undefined,
        parentFemaleId: undefined,
        healthInfos: [],
        ...defaultValues,
    });

    const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const availableStatuses = Object.values(StatusEnum);

    useEffect(() => {
        if (dog) {
            setFormState({
                ...dog,
                gender: dog.gender as GenderEnum,
                status: dog.status as StatusEnum,
                parentMaleId: dog.parentMaleId,
                parentFemaleId: dog.parentFemaleId,
            });
            setGalleryPhotos(dog.photos.map(photo => photo.photoUrl));
        }
    }, [dog]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let profilePhotoUrl = formState.profilePhoto;
        if (profilePhotoFile) {
            const response = await uploadImage(profilePhotoFile);
            profilePhotoUrl = response.url;
        }

        const galleryPhotoUrls = await Promise.all(galleryFiles.map(file => uploadImage(file).then(res => res.url)));

        const updatedFormState = {
            ...formState,
            profilePhoto: profilePhotoUrl,
            photos: galleryPhotoUrls.map(url => ({ photo_url: url, alt: `${formState.name}'s photo` }))
        };

        if (dogId) {
            await updateDogMutation.mutateAsync({ dogId: Number(dogId), dogData: updatedFormState as DogUpdate });
        } else {
            if (onDogCreated) {
                onDogCreated(updatedFormState as DogCreate);
            } else {
                await createDogMutation.mutateAsync(updatedFormState as DogCreate);
            }
        }
        onClose();
        navigate(redirect);
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
            <h1>{title}</h1>
            <Form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Name"
                />
                <Input
                    type="date"
                    name="dob"
                    value={formState.dob}
                    onChange={handleChange}
                    placeholder="Date of Birth"
                />
                <Input
                    type="text"
                    name="color"
                    value={formState.color}
                    onChange={handleChange}
                    placeholder="Color"
                />
                <Input
                    type="text"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    placeholder="Description"
                />
                <Dropdown
                    name="gender"
                    value={formState.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value={GenderEnum.Male}>{GenderEnum.Male}</option>
                    <option value={GenderEnum.Female}>{GenderEnum.Female}</option>
                </Dropdown>
                <div ref={dropdownRef}>
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
                </div>
                <ParentSelector
                    sireId={formState.parentMaleId}
                    damId={formState.parentFemaleId}
                    onSireChange={(e) => setFormState((prevState) => ({ ...prevState, parentMaleId: Number(e.target.value) }))}
                    onDamChange={(e) => setFormState((prevState) => ({ ...prevState, parentFemaleId: Number(e.target.value) }))}
                />
                {formState.status === StatusEnum.Available && (
                    <Input
                        type="number"
                        name="saleFee"
                        value={formState.saleFee ?? ''}
                        onChange={handleChange}
                        placeholder="Sale Price"
                    />
                )}
                <InputGroup>
                    <p>Select 1 profile image</p>
                    <ImageUpload maxImages={1} onImagesChange={handleProfilePhotoChange} initialImages={formState.profilePhoto ? [formState.profilePhoto] : []} />
                </InputGroup>
                <InputGroup>
                    <p>Select up to five gallery images</p>
                    <ImageUpload maxImages={5} onImagesChange={handleGalleryChange} initialImages={galleryPhotos} />
                </InputGroup>
                <ButtonContainer>
                    <Button variant="primary" type="submit">Save</Button>
                    <Button variant="error" onClick={onClose}>Cancel</Button>
                </ButtonContainer>
            </Form>
        </FormContainer>
    );
}
export default DogForm;