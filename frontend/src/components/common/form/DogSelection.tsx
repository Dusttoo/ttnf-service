import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { SelectedFilters, FilterProps, Dog } from '../../../api/types/dog';
import { useFilteredDogs } from '../../../hooks/useDog';
import { RootState } from '../../../store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../Error';
import { selectIsLoading } from '../../../store/loadingSlice';

interface DogDropdownProps {
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    filters: FilterProps;
    label: string;
    disabled?: boolean;
}

const DropdownContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const ImageContainer = styled.div`
    margin-bottom: 1rem;
`;

const DogImage = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 20%;
    object-fit: cover;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const Label = styled.label`
    font-size: 0.875rem;
    color: ${(props) => props.theme.colors.white};
    margin-bottom: 0.5rem;
`;

const Dropdown = styled.select`
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 4px;
    background-color: ${(props) => props.theme.colors.secondaryBackground};
    color: ${(props) => props.theme.colors.white};

    &:focus {
        outline: none;
        border-color: ${(props) => props.theme.colors.primaryDark};
    }
`;

const DogDropdown: React.FC<DogDropdownProps> = ({ name, value, onChange, filters, label, disabled = false }) => {
    const { data, error } = useFilteredDogs(filters as SelectedFilters);
    const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
    const isLoading = useSelector(selectIsLoading);

    useEffect(() => {
        if (data) {
            const dog = data.items.find((dog: Dog) => dog.id === value);
            setSelectedDog(dog || null);
        }
    }, [value, data]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorComponent message={(error as Error).message} />;
    }

    const dogs = data?.items || [];

    return (
        <DropdownContainer>
            {selectedDog && selectedDog.profilePhoto && (
                <ImageContainer>
                    <DogImage src={selectedDog.profilePhoto} alt={selectedDog.name} />
                </ImageContainer>
            )}
            <Label>{label}</Label>
            <Dropdown name={name} value={value} onChange={onChange} disabled={disabled}>
                <option value="">Select {label}</option>
                {dogs.map((dog: Dog) => (
                    <option key={dog.id} value={dog.id}>
                        {dog.name}
                    </option>
                ))}
            </Dropdown>
        </DropdownContainer>
    );
};

export default DogDropdown;