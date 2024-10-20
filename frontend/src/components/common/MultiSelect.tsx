import React from 'react';
import styled from 'styled-components';

const MultiSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const SelectBox = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  height: auto;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

interface MultiSelectProps {
  name: string;
  label: string;
  options: { label: string; value: number }[];
  selectedValues: number[];
  onChange: (selected: number[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  name,
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    onChange(selected);
  };

  return (
    <MultiSelectContainer>
      <Label htmlFor={name}>{label}</Label>
      <SelectBox
        id={name}
        name={name}
        multiple
        value={selectedValues.map((val) => String(val))}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </SelectBox>
    </MultiSelectContainer>
  );
};

export default MultiSelect;
