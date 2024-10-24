import React from 'react';
import styled from 'styled-components';

const MultiSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const SelectBox = styled.select<{ error?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.error ? props.theme.colors.error : props.theme.colors.primary)};
  border-radius: 4px;
  font-size: 1rem;
  height: auto;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

const ErrorMessage = styled.span`
  color: ${(props) => props.theme.colors.error};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

interface MultiSelectProps {
    name: string;
    label: string;
    options: { label: string; value: number }[];
    selectedValues: number[];
    onChange: (selected: number[]) => void;
    error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
                                                     name,
                                                     label,
                                                     options,
                                                     selectedValues,
                                                     onChange,
                                                     error,
                                                 }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, (option) =>
            Number(option.value),
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
                error={!!error}
            >
                {options.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                        {option.label}
                    </option>
                ))}
            </SelectBox>
            {error && <ErrorMessage>{error}</ErrorMessage>} {/* Display error message */}
        </MultiSelectContainer>
    );
};

export default MultiSelect;