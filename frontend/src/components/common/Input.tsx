import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  width?: string;
  id?: string;
  required?: boolean;
}

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const StyledLabel = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

const RequiredAsterisk = styled.span`
  color: ${(props) => props.theme.colors.error}; // Styled for the asterisk
  margin-left: 4px;
`;

const StyledInput = styled.input<Partial<InputProps>>`
  padding: 10px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  width: ${(props) => props.width || '100%'};
`;

const Input: React.FC<InputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  label,
  width,
  id,
  required = false,
}) => {
  return (
    <StyledInputWrapper>
      {label && (
        <StyledLabel htmlFor={id}>
          {label}
          {required && <RequiredAsterisk>*</RequiredAsterisk>}
        </StyledLabel>
      )}
      <StyledInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        width={width}
        required={required}
      />
    </StyledInputWrapper>
  );
};

export default Input;
