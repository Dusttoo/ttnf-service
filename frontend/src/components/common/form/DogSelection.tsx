import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { SelectedFilters, FilterProps, Dog } from '../../../api/types/dog';
import { useFilteredDogs } from '../../../hooks/useDog';
import { RootState } from '../../../store';

interface DogDropdownProps {
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    filters: FilterProps;
    label: string;
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
`;

const Dropdown = styled.select`
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 4px;
`;

const DogDropdown: React.FC<DogDropdownProps> = ({ name, value, onChange, filters, label }) => {
    const { data, error } = useFilteredDogs(filters as SelectedFilters);
    const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
    const { isLoading } = useSelector((state: RootState) => state.loading);
    
    useEffect(() => {
        if (data) {
            const dog = data.items.find((dog: Dog) => dog.id === value);
            setSelectedDog(dog || null);
        }
    }, [value, data]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error loading dogs</p>;
    }

    const dogs = data?.items || [];

    return (
        <DropdownContainer>
            {selectedDog && selectedDog.profilePhoto && (
                <ImageContainer>
                    <DogImage src={selectedDog.profilePhoto} alt={selectedDog.name} />
                </ImageContainer>
            )}
            <label>{label}</label>
            <Dropdown name={name} value={value} onChange={onChange}>
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