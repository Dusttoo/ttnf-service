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
    error?: string;
    style?: React.CSSProperties;
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
  padding: 0.75rem;
  border: 1px solid ${(props) =>
    props.error ? props.theme.colors.error : props.theme.colors.primary}; // Red border for error
  border-radius: 4px;
  width: ${(props) => props.width || '100%'};
  background-color: ${(props) => props.theme.colors.neutralBackground};
  font-size: 1rem;
  color: ${(props) => props.theme.colors.white};
`;

const ErrorMessage = styled.span`
  color: ${(props) => props.theme.colors.error}; // Styled for error message
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
                                         error,
                                         style
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
                error={error}
                style={style}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>} {/* Displaying the error message */}
        </StyledInputWrapper>
    );
};

export default Input;