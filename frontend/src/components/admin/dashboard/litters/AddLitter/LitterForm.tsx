import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { LitterCreate } from '../../../../../api/types/breeding';
import { useFormContext } from '../../../../../context/FormContext';
import BreedingSelection from '../../../../common/form/BreedingSelection';
import DateInput from '../../../../common/form/DateInput';
import NumberInput from '../../../../common/form/NumberInput';
import Input from '../../../../common/Input';
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

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
`;

interface LitterFormProps {
  nextStep: () => void;
}

const LitterForm: React.FC<LitterFormProps> = ({ nextStep }) => {
  const { litterData, updateLitterData, setCurrentStep } = useFormContext();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LitterCreate>({
    defaultValues: litterData,
  });

  useEffect(() => {
    reset(litterData);
  }, [litterData, reset]);

  const onFormSubmit: SubmitHandler<LitterCreate> = (data) => {
    console.log('Submitted Litter Data:', data);
    updateLitterData(data);
    nextStep();
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="breedingId"
        render={({ field }) => (
          <BreedingSelection
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            filters={{}}
            label="Breeding"
          />
        )}
      />
      {errors.breedingId && <ErrorText>{errors.breedingId.message}</ErrorText>}

      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <DateInput
            label='Breeding Date:'
            selectedDate={new Date(litterData.birthDate)}
            {...field} />
        )}
      />
      {errors.birthDate && <ErrorText>{errors.birthDate.message}</ErrorText>}

      <Controller
        control={control}
        name="numberOfPuppies"
        render={({ field }) => (
          <NumberInput
            value={litterData.numberOfPuppies}
            type="number"
            onChange={field.onChange}
          />
        )}
      />

      {errors.numberOfPuppies && (
        <ErrorText>{errors.numberOfPuppies.message}</ErrorText>
      )}

      <Controller
        control={control}
        name="pedigreeUrl"
        render={({ field }) => (
          <Input
            value={field.value || ''}
            label="Pedigree URL"
            name={field.name}
            placeholder="Pedigree URL"
            type="text"
            onChange={field.onChange}
          />
        )}
      />

      <NavigationButtons>
        <Button type="submit">Next</Button>
      </NavigationButtons>
    </Form>
  );
};

export default LitterForm;