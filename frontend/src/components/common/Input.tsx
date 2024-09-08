import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; 
  label?: string;
}

const StyledInput = styled.input<InputProps>`
  padding: 10px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  width: 100%;
`;

const Input: React.FC<InputProps> = ({ type, value, onChange, placeholder, label }) => {
  return (
    <>
      {label && <label>{label}</label>}
      <StyledInput type={type} value={value} onChange={onChange} placeholder={placeholder} />

    </>
  );
};

export default Input;