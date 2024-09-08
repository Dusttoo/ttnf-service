import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { StatusBadge } from './StatusBadge';
import { Dog } from '../../types';
import { FilterProps, SelectedFilters, SearchResult } from '../../types';
import SearchBar from './SearchBar';
import { useFilteredDogs } from '../../hooks/useDog';

const FilterContainer = styled.div`
  position: relative;
  display: inline-block;
  margin: 1rem;
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

const Dropdown = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
`;

const ClearAll = styled.span`
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary};
  margin-left: auto;
  margin-bottom: 0.5rem;
`;

const FilterComponent: React.FC<FilterProps> = ({
    onGenderChange,
    onStatusChange,
    onSireChange,
    onDamChange,
    onColorChange,
    gender = '',
    status = [],
    sire = undefined,
    dam = undefined,
    color = '',
    isGenderDisabled = false,
    isColorDisabled = true,
    isDamDisabled = true,
    isSireDisabled = true
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        gender,
        status,
        sire,
        dam,
        color,
    });

    const { data: dogsData } = useFilteredDogs({ owned: true });
    const dogs = dogsData?.items || [];
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleCheckboxChange = (type: string, value: string) => {
        setSelectedFilters((prevFilters) => {
            const newFilters = { ...prevFilters };

            if (type === 'gender') {
                newFilters.gender = value;
                if (onGenderChange) onGenderChange(value);
            } else {
                const newStatus = newFilters.status!.includes(value)
                    ? newFilters.status!.filter((status) => status !== value)
                    : [...newFilters.status!, value];

                newFilters.status = newStatus;
                if (onStatusChange) onStatusChange(newStatus);
            }

            return newFilters;
        });
    };

    const handleBadgeRemove = (statusToRemove: string) => {
        setSelectedFilters((prevFilters) => {
            const newFilters = { ...prevFilters };
            newFilters.status = newFilters.status!.filter((status) => status !== statusToRemove);
            if (onStatusChange) onStatusChange([...newFilters.status!]);
            return newFilters;
        });
    };

    const handleClearAll = () => {
        const clearedFilters: SelectedFilters = {
            gender: '',
            status: [],
            sire: undefined,
            dam: undefined,
            color: ''
        };
        setSelectedFilters(clearedFilters);
        if (onGenderChange) onGenderChange('');
        if (onStatusChange) onStatusChange([]);
        if (onSireChange) onSireChange(undefined);
        if (onDamChange) onDamChange(undefined);
        if (onColorChange) onColorChange('');
    };

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'sire' | 'dam') => {
        const selectedDog = dogs.find((dog: Dog) => dog.id === parseInt(e.target.value));
        if (selectedDog) {
            if (type === 'sire') {
                setSelectedFilters(prevFilters => ({ ...prevFilters, sire: selectedDog }));
                if (onSireChange) onSireChange(selectedDog);
            } else {
                setSelectedFilters(prevFilters => ({ ...prevFilters, dam: selectedDog }));
                if (onDamChange) onDamChange(selectedDog);
            }
            setShowDropdown(false);
        }
    };

    const handleResultSelect = (result: SearchResult) => {
        console.log('Selected result:', result);
    };

    const activeFiltersCount = selectedFilters.status!.length + (selectedFilters.sire ? 1 : 0) + (selectedFilters.dam ? 1 : 0);
    return (
        <FilterContainer ref={dropdownRef}>
            <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
                {selectedFilters.status!.length > 0 && selectedFilters.status!.map((status) => (
                    <StatusBadge key={status} color="#E76F00">
                        {status}
                        <span onClick={() => handleBadgeRemove(status)}>&#x2715;</span>
                    </StatusBadge>
                ))}
                {selectedFilters.sire && (
                    <StatusBadge color="#E76F00">
                        Sire Selected
                        <span onClick={() => {
                            setSelectedFilters((prevFilters) => ({ ...prevFilters, sire: undefined }));
                            if (onSireChange) onSireChange(undefined);
                        }}>
                            &#x2715;
                        </span>
                    </StatusBadge>
                )}
                {selectedFilters.dam && (
                    <StatusBadge color="#E76F00">
                        Dam Selected
                        <span onClick={() => {
                            setSelectedFilters((prevFilters) => ({ ...prevFilters, dam: undefined }));
                            if (onDamChange) onDamChange(undefined);
                        }}>
                            &#x2715;
                        </span>
                    </StatusBadge>
                )}
                {activeFiltersCount > 0 ? (
                    <StatusBadge color="#E76F00">{activeFiltersCount}</StatusBadge>
                ) : (
                    'Filters'
                )}
                <span>&#9660;</span>
            </DropdownButton>
            <DropdownContent show={showDropdown}>
                <SearchBar
                    resources={['dogs', 'productions', 'breedings', 'litters']}
                    limit={5}
                    onResultSelect={handleResultSelect}
                />
                <ClearAll onClick={handleClearAll}>Clear All</ClearAll>
                {!isGenderDisabled && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <FilterLabel>Gender:</FilterLabel>
                        </div>
                        <CheckboxContainer>
                            <Checkbox
                                type="checkbox"
                                value="male"
                                checked={selectedFilters.gender === 'male'}
                                onChange={(e) => handleCheckboxChange('gender', e.target.checked ? 'male' : '')}
                                disabled={isGenderDisabled}
                            />
                            <FilterLabel>Male</FilterLabel>
                        </CheckboxContainer>
                        <CheckboxContainer>
                            <Checkbox
                                type="checkbox"
                                value="female"
                                checked={selectedFilters.gender === 'female'}
                                onChange={(e) => handleCheckboxChange('gender', e.target.checked ? 'female' : '')}
                                disabled={isGenderDisabled}
                            />
                            <FilterLabel>Female</FilterLabel>
                        </CheckboxContainer>
                    </>
                )}
                {onStatusChange && (
                    <>
                        <FilterLabel>Status:</FilterLabel>
                        <CheckboxContainer>
                            <Checkbox
                                type="checkbox"
                                value="available"
                                checked={selectedFilters.status!.includes('available')}
                                onChange={() => handleCheckboxChange('status', 'available')}
                            />
                            <FilterLabel>Available</FilterLabel>
                        </CheckboxContainer>
                        <CheckboxContainer>
                            <Checkbox
                                type="checkbox"
                                value="sold"
                                checked={selectedFilters.status!.includes('sold')}
                                onChange={() => handleCheckboxChange('status', 'sold')}
                            />
                            <FilterLabel>Sold</FilterLabel>
                        </CheckboxContainer>
                        {selectedFilters.gender === 'male' && (
                            <CheckboxContainer>
                                <Checkbox
                                    type="checkbox"
                                    value="stud"
                                    checked={selectedFilters.status!.includes('stud')}
                                    onChange={() => handleCheckboxChange('status', 'stud')}
                                />
                                <FilterLabel>Available For Stud</FilterLabel>
                            </CheckboxContainer>
                        )}
                    </>
                )}
                {!isSireDisabled && onSireChange && (
                    <>
                        <FilterLabel>Sire:</FilterLabel>
                        <Dropdown
                            onChange={(e) => handleDropdownChange(e, 'sire')}
                            value={selectedFilters.sire?.id ?? ''}
                        >
                            <option value="">Select Sire</option>
                            {dogs.filter((dog: Dog) => dog.gender.toLowerCase() === 'male').map((dog: Dog) => (
                                <option key={dog.id} value={dog.id}>{dog.name}</option>
                            ))}
                        </Dropdown>
                    </>
                )}

                {!isDamDisabled && onDamChange && (
                    <>
                        <FilterLabel>Dam:</FilterLabel>
                        <Dropdown
                            onChange={(e) => handleDropdownChange(e, 'dam')}
                            value={selectedFilters.dam?.id ?? ''}
                        >
                            <option value="">Select Dam</option>
                            {dogs.filter((dog: Dog) => dog.gender.toLowerCase() === 'female').map((dog: Dog) => (
                                <option key={dog.id} value={dog.id}>{dog.name}</option>
                            ))}
                        </Dropdown>
                    </>
                )}
                {!isColorDisabled && onColorChange && (
                    <>
                        <FilterLabel>Color:</FilterLabel>
                        <Dropdown onChange={(e) => onColorChange(e.target.value)} value={selectedFilters.color}>
                            <option value="">Select Color</option>
                            <option value="color1">Color 1</option>
                            <option value="color2">Color 2</option>
                        </Dropdown>
                    </>
                )}
            </DropdownContent>
        </FilterContainer>
    );
};

export default FilterComponent;
