import React from 'react';
import styled from 'styled-components';

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.neutralBackground};
  color: ${(props) => props.theme.colors.white};
  border-radius: 4px;
  font-size: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.colors.text};
  font-size: 1rem;
`;

type DropdownOption = string | { value: string; label: string };

interface DropdownProps {
  name: string;
  options: DropdownOption[]; // Accept an array of strings or { value, label } objects
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  name,
  options,
  value,
  onChange,
  label,
}) => {
  return (
    <div>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select name={name} value={value} onChange={onChange}>
        {options.map((option, index) =>
          typeof option === 'string' ? (
            <option key={index} value={option}>
              {option}
            </option>
          ) : (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </Select>
    </div>
  );
};

export default Dropdown;