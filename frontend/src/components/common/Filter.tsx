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
  margin: 1rem;
  width: 100%;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const DropdownButton = styled.button`
  background-color: white;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 8px;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  z-index: 1;
  width: 100%;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  margin-right: 1rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  accent-color: ${(props) => props.theme.colors.primary};
`;

const ClearAll = styled.button`
  background-color: transparent;
  color: ${(props) => props.theme.colors.error};
  font-size: 14px;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
  text-align: right;
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
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
  isGenderDisabled = false,
  isColorDisabled = true,
  isDamDisabled = true,
  isSireDisabled = true
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
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

  const handleCheckboxChange = (value: StatusEnum) => {
    const newStatus: StatusEnum[] = selectedFilters.status!.includes(value)
      ? selectedFilters.status!.filter((status) => status !== value)
      : [...selectedFilters.status!, value];
    setSelectedFilters((prevFilters) => ({ ...prevFilters, status: newStatus }));
    onStatusChange && onStatusChange(newStatus);
  };

  const handleClearAll = () => {
    setSelectedFilters({ status: [], sire: undefined, dam: undefined, color: '' });
    onStatusChange && onStatusChange([]);
    onSireChange && onSireChange(undefined);
    onDamChange && onDamChange(undefined);
    onColorChange && onColorChange('');
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'sire' | 'dam') => {
    const selectedDogId = parseInt(e.target.value, 10);
    if (type === 'sire') {
      onSireChange && onSireChange(dogs.find((dog) => dog.id === selectedDogId));
    } else if (type === 'dam') {
      onDamChange && onDamChange(dogs.find((dog) => dog.id === selectedDogId));
    }
  };

  const handleApplyFilters = () => {
    setShowDropdown(false); // Close the dropdown
    // Add any additional logic to handle the filters, if needed
  };

  return (
    <FilterContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        Filters <span>&#9660;</span>
      </DropdownButton>

      <DropdownContent show={showDropdown}>
        {/* Status Section */}
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
              <FilterLabel>{statusOption}</FilterLabel>
            </CheckboxContainer>
          ))}
        </Section>

        {/* Conditionally render Gender section */}
        {!isGenderDisabled && (
          <Section>
            <SectionTitle>Gender</SectionTitle>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Male}
                onChange={() => onGenderChange && onGenderChange(GenderEnum.Male)}
              />
              <FilterLabel>Male</FilterLabel>
            </CheckboxContainer>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={selectedFilters.gender === GenderEnum.Female}
                onChange={() => onGenderChange && onGenderChange(GenderEnum.Female)}
              />
              <FilterLabel>Female</FilterLabel>
            </CheckboxContainer>
          </Section>
        )}

        {/* Conditionally render Sire section */}
        {!isSireDisabled && (
          <Section>
            <SectionTitle>Sire</SectionTitle>
            <Dropdown
              name="sire"
              options={dogs.filter((dog) => dog.gender.toLowerCase() === 'male').map((dog) => dog.name)}
              value={selectedFilters.sire?.id.toString() || ''}
              onChange={(e) => handleDropdownChange(e, 'sire')}
            />
          </Section>
        )}

        {/* Conditionally render Dam section */}
        {!isDamDisabled && (
          <Section>
            <SectionTitle>Dam</SectionTitle>
            <Dropdown
              name="dam"
              options={dogs.filter((dog) => dog.gender.toLowerCase() === 'female').map((dog) => dog.name)}
              value={selectedFilters.dam?.id.toString() || ''}
              onChange={(e) => handleDropdownChange(e, 'dam')}
            />
          </Section>
        )}

        {/* Conditionally render Color section */}
        {!isColorDisabled && (
          <Section>
            <SectionTitle>Color</SectionTitle>
            <select onChange={(e) => onColorChange && onColorChange(e.target.value)} value={selectedFilters.color}>
              <option value="">Select Color</option>
              {/* Populate with color options */}
            </select>
          </Section>
        )}

        <ClearAll onClick={handleClearAll}>Clear All</ClearAll>
        <ApplyButton onClick={handleApplyFilters}>Apply Filters</ApplyButton>
      </DropdownContent>
    </FilterContainer>
  );
};

export default FilterComponent;