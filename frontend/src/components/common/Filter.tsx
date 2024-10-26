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
  max-width: 600px;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const DropdownButton = styled.button`
  background-color: white;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 1;
  width: 100%;
`;

const Section = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  accent-color: ${(props) => props.theme.colors.primary};
`;

const InputSelect = styled.select`
  padding: 0.5rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.border};
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
  font-size: 14px;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const ApplyButton = styled.button`
  padding: 0.8rem 1.2rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  border: none;
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
    const newStatus: StatusEnum[] = selectedFilters.status!.includes(value)
      ? selectedFilters.status!.filter((status) => status !== value)
      : [...selectedFilters.status!, value];
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      status: newStatus,
    }));
    onStatusChange && onStatusChange(newStatus);
  };

  const handleClearAll = () => {
    setSelectedFilters({
      status: [],
      sire: undefined,
      dam: undefined,
      color: '',
    });
    onStatusChange && onStatusChange([]);
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
                <Checkbox
                  type="checkbox"
                  value={statusOption}
                  checked={selectedFilters.status!.includes(statusOption)}
                  onChange={() => handleCheckboxChange(statusOption)}
                />
                <label>{statusOption}</label>
              </CheckboxContainer>
            ))}
          </Section>
        )}

        {/* Conditionally render Gender section */}
        {!isGenderDisabled && (
          <Section>
            <SectionTitle>Gender</SectionTitle>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Male}
                onChange={() => handleGenderChange(GenderEnum.Male)}
              />
              <label>Male</label>
            </CheckboxContainer>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Female}
                onChange={() => handleGenderChange(GenderEnum.Female)}
              />
              <label>Female</label>
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
