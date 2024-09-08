import React from 'react';
import styled from 'styled-components';

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
`;

interface DropdownProps {
    name: string;
    options: string[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ name, options, value, onChange }) => {
    return (
        <Select name={name} value={value} onChange={onChange}>
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </Select>
    );
};

export default Dropdown;