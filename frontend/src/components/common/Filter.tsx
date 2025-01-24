import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dog } from '../../api/types/dog';
import { GenderEnum, StatusEnum } from '../../api/types/core'; // Import GenderEnum
import { FilterProps, SelectedFilters } from '../../api/types/dog';
import { useFilteredDogs } from '../../hooks/useDog';
import Dropdown from './form/Dropdown';

const FilterContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 1rem;
  width: 100%;
  max-width: 400px;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const DropdownButton = styled.button`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }

  span {
    font-size: 1.2rem;
  }
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  z-index: 10;
  width: 100%;
  max-width: 300px; /* Set a maximum width */
  min-width: 250px; /* Set a minimum width */
  overflow-y: auto;
  top: 3.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const StyledCheckbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:checked {
    background-color: ${(props) => props.theme.colors.primary};
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:checked::after {
    content: '✔';
    color: ${(props) => props.theme.colors.white};
    font-size: 0.9rem;
    position: absolute;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryLight};
  }
`;

const InputSelect = styled.select`
  padding: 0.5rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  color: ${(props) => props.theme.colors.text};
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const ClearAll = styled.button`
  background-color: transparent;
  color: ${(props) => props.theme.colors.error};
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.theme.colors.errorDark};
  }
`;

const ApplyButton = styled.button`
  padding: 0.8rem 1.2rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
  }
`;

const FilterComponent: React.FC<FilterProps> = ({
  onGenderChange,
  onStatusChange,
  onSireChange,
  onDamChange,
  onColorChange,
  status = [],
  sire = undefined,
  dam = undefined,
  color = '',
  gender = undefined,
  isGenderDisabled = false,
  isStatusDisabled = false,
  isColorDisabled = true,
  isDamDisabled = true,
  isSireDisabled = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    status,
    gender,
    sire,
    dam,
    color,
  });

  const { data: dogsData } = useFilteredDogs({ owned: true });
  const dogs = dogsData?.items || [];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCheckboxChange = (value: StatusEnum) => {
    let newStatus: StatusEnum[];
  
    if (selectedFilters.status!.includes(value)) {
      newStatus = selectedFilters.status!.filter((status) => status !== value);
    } else {
      newStatus = [...selectedFilters.status!, value];
    }
  
    if (newStatus.length === 0) {
      newStatus = [StatusEnum.Active];
    }
  
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      status: newStatus,
    }));
  
    onStatusChange && onStatusChange(newStatus);
  };

  const handleClearAll = () => {
    const defaultStatus = [StatusEnum.Active];
    setSelectedFilters({
      status: defaultStatus,
      sire: undefined,
      dam: undefined,
      color: '',
    });
  
    onStatusChange && onStatusChange(defaultStatus);
    onSireChange && onSireChange(undefined);
    onDamChange && onDamChange(undefined);
    onColorChange && onColorChange('');
  };

  const handleDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: 'sire' | 'dam'
  ) => {
    const selectedDogId = parseInt(e.target.value, 10);
    if (type === 'sire') {
      const selectedSire = dogs.find((dog: Dog) => dog.id === selectedDogId);
      handleSireChange(selectedSire);
    } else if (type === 'dam') {
      const selectedDam = dogs.find((dog: Dog) => dog.id === selectedDogId);
      handleDamChange(selectedDam);
    }
  };

  const handleSireChange = (sire?: Dog) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      sire: sire ? { id: sire.id } : undefined,
    }));
    onSireChange && onSireChange(sire);
  };

  const handleDamChange = (dam?: Dog) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      dam: dam ? { id: dam.id } : undefined,
    }));
    onDamChange && onDamChange(dam);
  };

  const handleGenderChange = (selectedGender: GenderEnum) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      gender:
        prevFilters.gender === selectedGender ? undefined : selectedGender,
    }));
    onGenderChange && onGenderChange(selectedGender);
  };

  const handleApplyFilters = () => {
    if (selectedFilters.status!.length === 0) {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        status: [StatusEnum.Active],
      }));
  
      onStatusChange && onStatusChange([StatusEnum.Active]);
    }
  
    setShowDropdown(false);
  };

  return (
    <FilterContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        Filters <span>&#9660;</span>
      </DropdownButton>

      <DropdownContent show={showDropdown}>
        {/* Status Section */}
        {!isStatusDisabled && (
          <Section>
            <SectionTitle>Status</SectionTitle>
            {Object.values(StatusEnum).map((statusOption) => (
              <CheckboxContainer key={statusOption}>
                <StyledCheckbox
                  type="checkbox"
                  value={statusOption}
                  checked={selectedFilters.status!.includes(statusOption)}
                  onChange={() => handleCheckboxChange(statusOption)}
                />
                <CheckboxLabel>{statusOption}</CheckboxLabel>
              </CheckboxContainer>
            ))}
          </Section>
        )}

        {/* Conditionally render Gender section */}
        {!isGenderDisabled && (
          <Section>
            <SectionTitle>Gender</SectionTitle>
            <CheckboxContainer>
              <StyledCheckbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Male}
                onChange={() => handleGenderChange(GenderEnum.Male)}
              />
              <CheckboxLabel>Male</CheckboxLabel>
            </CheckboxContainer>
            <CheckboxContainer>
              <StyledCheckbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Female}
                onChange={() => handleGenderChange(GenderEnum.Female)}
              />
              <CheckboxLabel>Female</CheckboxLabel>
            </CheckboxContainer>
          </Section>
        )}

        {/* Conditionally render Sire section */}
        {!isSireDisabled && (
          <Section>
            <SectionTitle>Sire</SectionTitle>
            <InputSelect
              name="sire"
              value={selectedFilters.sire?.id.toString() || ''}
              onChange={(e) => handleDropdownChange(e, 'sire')}
            >
              <option value="">Select Sire</option>
              {dogs
                .filter((dog: Dog) => dog.gender.toLowerCase() === 'male')
                .map((dog: Dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
            </InputSelect>
          </Section>
        )}

        {/* Conditionally render Dam section */}
        {!isDamDisabled && (
          <Section>
            <SectionTitle>Dam</SectionTitle>
            <InputSelect
              name="dam"
              value={selectedFilters.dam?.id.toString() || ''}
              onChange={(e) => handleDropdownChange(e, 'dam')}
            >
              <option value="">Select Dam</option>
              {dogs
                .filter((dog: Dog) => dog.gender.toLowerCase() === 'female')
                .map((dog: Dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
            </InputSelect>
          </Section>
        )}

        {/* Conditionally render Color section */}
        {!isColorDisabled && (
          <Section>
            <SectionTitle>Color</SectionTitle>
            <InputSelect
              onChange={(e) => onColorChange && onColorChange(e.target.value)}
              value={selectedFilters.color}
            >
              <option value="">Select Color</option>
              {/* Add color options here */}
            </InputSelect>
          </Section>
        )}

        <ButtonContainer>
          <ClearAll onClick={handleClearAll}>Clear All</ClearAll>
          <ApplyButton onClick={handleApplyFilters}>Apply Filters</ApplyButton>
        </ButtonContainer>
      </DropdownContent>
    </FilterContainer>
  );
};

export default FilterComponent;
