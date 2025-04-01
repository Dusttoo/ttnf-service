// src/components/admin/dashboard/litters/AddLitter/PuppyForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { PuppyCreate } from '../../../../../api/types/dog';
import { useFormContext } from '../../../../../context/FormContext';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  background-color: transparent;
`;

export const Label = styled.label`
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

export const Input = styled.input`
  background-color: ${({ theme }) => theme.ui.input.background};
  border: 1px solid ${({ theme }) => theme.ui.input.border};
  color: ${({ theme }) => theme.ui.input.color};
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
`;

export const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.ui.button.primary.background};
  color: ${({ theme }) => theme.ui.button.primary.color};
  margin-top: 2rem;
  padding: 0.5rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

interface PuppyFormProps {
  initialValues: PuppyCreate;
  title: string;
  onSubmit: (data: PuppyCreate) => void;
}

const PuppyForm: React.FC<PuppyFormProps> = ({ initialValues }) => {
  // Use react-hook-form without Yup; we specify required validations inline.
  const { register, handleSubmit, formState: { errors } } = useForm<PuppyCreate>({
    defaultValues: initialValues,
  });

  // Retrieve context functions and state for puppy data.
  const { updatePuppyData, puppyIndex, setCurrentStep } = useFormContext();

  const onSubmit = (data: PuppyCreate) => {
    // Update the context's puppy data at the current index.
    updatePuppyData(puppyIndex, data);
    // Optionally, advance to the next step or handle navigation via context:
    // For example:
    // setCurrentStep(2);
  };

  return (
    <div>
      <h2>Puppy {puppyIndex + 1} Details</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Label>
          Name:
          <Input
            type="text"
            {...register('name', { required: 'Puppy name is required' })}
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
        </Label>

        <Label>
          Gender:
          <select {...register('gender', { required: 'Gender is required' })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <ErrorText>{errors.gender.message}</ErrorText>}
        </Label>

      </Form>
    </div>
  );
};

export default PuppyForm;