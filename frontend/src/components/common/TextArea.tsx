import React from 'react';
import styled from 'styled-components';

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  width?: string;
  id?: string;
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
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  width: ${(props) => props.width || '100%'};
  min-height: 100px;
  resize: vertical;
`;

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  width,
  id,
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
      />
    </StyledTextareaWrapper>
  );
};

export default Textarea;
