import React from 'react';
import styled from 'styled-components';

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.neutralBackground};
  color: ${(props) => props.theme.colors.white};
  border-radius: 4px;
  font-size: 1rem;
`;

interface DropdownProps {
  name: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string; // Optional label prop
}

const Dropdown: React.FC<DropdownProps> = ({
  name,
  options,
  value,
  onChange,
  label,
}) => {
  return (
    <DropdownWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select name={name} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </DropdownWrapper>
  );
};

export default Dropdown;