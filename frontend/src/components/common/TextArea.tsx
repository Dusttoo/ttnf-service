import React from 'react';
import styled from 'styled-components';

interface TextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    label?: string;
    width?: string;
    id?: string;
    error?: string;
}

const StyledTextareaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const StyledLabel = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

const StyledTextarea = styled.textarea<Partial<TextareaProps>>`
  padding: 10px;
  border: 1px solid ${(props) =>
    props.error ? props.theme.colors.error : props.theme.colors.primary}; // Add red border on error
  border-radius: 4px;
  width: ${(props) => props.width || '100%'};
  min-height: 100px;
  resize: vertical;
`;

const ErrorMessage = styled.span`
  color: ${(props) => props.theme.colors.error}; // Styled for the error message
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Textarea: React.FC<TextareaProps> = ({
                                               value,
                                               onChange,
                                               placeholder,
                                               label,
                                               width,
                                               id,
                                               error,
                                           }) => {
    return (
        <StyledTextareaWrapper>
            {label && <StyledLabel htmlFor={id}>{label}</StyledLabel>}
            <StyledTextarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                width={width}
                error={error}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </StyledTextareaWrapper>
    );
};

export default Textarea;