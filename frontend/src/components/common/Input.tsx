import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  width?: string;
}

const StyledInput = styled.input<InputProps>`
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
}) => {
  return (
    <>
      {label && <label>{label}</label>}
      <StyledInput
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        width={width}
      />
    </>
  );
};

export default Input;
