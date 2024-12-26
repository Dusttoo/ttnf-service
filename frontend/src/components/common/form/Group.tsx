// FormGroup.tsx
import React from 'react';
import styled from 'styled-components';

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
}

const Group = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const FormGroup: React.FC<FormGroupProps> = ({ label, children }) => {
  return (
    <Group>
      <label>{label}</label>
      {children}
    </Group>
  );
};

export default FormGroup;