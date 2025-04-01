// src/components/admin/dashboard/litters/AddLitter/LitterForm.tsx
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { LitterCreate } from '../../../../../api/types/breeding';
import { useFormContext } from '../../../../../context/FormContext';
import BreedingSelection from '../../../../common/form/BreedingSelection';
import { Button, NavigationButtons } from './MultiStepForm';

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

interface LitterFormProps {
  nextStep: () => void;
}

const LitterForm: React.FC<LitterFormProps> = ({ nextStep }) => {
  // Access context for shared state and navigation functions.
  const { litterData, updateLitterData, setCurrentStep } = useFormContext();

  // Initialize the form with context's litter data.
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LitterCreate>({
    defaultValues: litterData,
  });

  // Reset form when context changes.
  useEffect(() => {
    reset(litterData);
  }, [litterData, reset]);

  // onSubmit updates context and calls the provided nextStep function.
  const onFormSubmit: SubmitHandler<LitterCreate> = (data) => {
    console.log('Submitted Litter Data:', data);
    updateLitterData(data);
    nextStep();
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Label>
        Breeding ID:
        {litterData.breedingId ? (
          <Input type="number" {...register('breedingId')} disabled />
        ) : (
          <Controller
            control={control}
            name="breedingId"
            render={({ field }) => (
              <BreedingSelection
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                filters={{}} // Add filters if needed.
                label="Breeding"
              />
            )}
          />
        )}
        {errors.breedingId && <ErrorText>{errors.breedingId.message}</ErrorText>}
      </Label>

      <Label>
        Birth Date:
        <Input
          type="date"
          {...register('birthDate', { required: 'Birth date is required' })}
        />
        {errors.birthDate && <ErrorText>{errors.birthDate.message}</ErrorText>}
      </Label>

      <Label>
        Number of Puppies:
        <Input
          type="number"
          {...register('numberOfPuppies', {
            required: 'Number of puppies is required',
            min: { value: 1, message: 'At least one puppy is required' },
            valueAsNumber: true,
          })}
        />
        {errors.numberOfPuppies && (
          <ErrorText>{errors.numberOfPuppies.message}</ErrorText>
        )}
      </Label>

      <Label>
        Pedigree URL:
        <Input type="text" {...register('pedigreeUrl')} />
      </Label>

      <NavigationButtons>
        <Button type="submit">Next</Button>
      </NavigationButtons>
    </Form>
  );
};

export default LitterForm;