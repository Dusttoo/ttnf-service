// src/components/admin/dashboard/litters/AddLitter/AllPuppiesForm.tsx
import React, { useEffect } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { GenderEnum } from '../../../../../api/types/core';
import { PuppyCreate } from '../../../../../api/types/dog';
import { useFormContext } from '../../../../../context/FormContext';

export interface FormValues {
    puppies: PuppyCreate[];
}

interface AllPuppiesFormProps {
    nextStep: () => void;
    prevStep: () => void;
}

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  margin: 2rem auto;
`;

const FieldGroup = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1rem;
  border-radius: 4px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.ui.input.border};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.ui.button.primary.background};
  color: ${({ theme }) => theme.ui.button.primary.color};
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.fonts.primary};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AllPuppiesForm: React.FC<AllPuppiesFormProps> = ({ nextStep, prevStep }) => {
    const { litterData, puppyData, setPuppyData } = useFormContext();
    const numberOfPuppies = litterData.numberOfPuppies;

    // Initialize default values with the litter's birthDate pre-populated for each puppy.
    const { register, control, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: {
            puppies: Array.from({ length: numberOfPuppies }, () => ({
                name: '',
                gender: GenderEnum.Male, // default value
                dob: litterData.birthDate ? litterData.birthDate : '',
                profilePhoto: '',
            })),
        },
    });

    // Manage the array of puppy fields.
    const { fields } = useFieldArray({
        control,
        name: 'puppies',
    });

    // If puppyData exists and its length matches, reset the form.
    useEffect(() => {
        if (puppyData.length === numberOfPuppies) {
            reset({ puppies: puppyData });
        } else {
            // Optionally, if puppyData is empty, we can initialize using litterData.birthDate.
            reset({
                puppies: Array.from({ length: numberOfPuppies }, () => ({
                    name: '',
                    gender: GenderEnum.Male,
                    dob: litterData.birthDate ? litterData.birthDate : '',
                    profilePhoto: '',
                })),
            });
        }
    }, [puppyData, numberOfPuppies, litterData.birthDate, reset]);

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log('Submitted puppy data:', data);
        setPuppyData(data.puppies);
        nextStep();
    };

    return (
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => (
                <FieldGroup key={item.id}>
                    <h3>Puppy {index + 1} Details</h3>
                    <Label htmlFor={`puppies.${index}.name`}>Name:</Label>
                    <Input
                        id={`puppies.${index}.name`}
                        {...register(`puppies.${index}.name` as const, { required: 'Name is required' })}
                        placeholder="Enter puppy name"
                    />

                    <Label htmlFor={`puppies.${index}.gender`}>Gender:</Label>
                    <select
                        id={`puppies.${index}.gender`}
                        {...register(`puppies.${index}.gender` as const, { required: 'Gender is required' })}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <Label htmlFor={`puppies.${index}.dob`}>Date of Birth:</Label>
                    <Input
                        id={`puppies.${index}.dob`}
                        type="date"
                        {...register(`puppies.${index}.dob` as const, { required: 'Date of birth is required' })}
                    />

                    <Label htmlFor={`puppies.${index}.profilePhoto`}>Profile Photo URL:</Label>
                    <Input
                        id={`puppies.${index}.profilePhoto`}
                        {...register(`puppies.${index}.profilePhoto` as const)}
                        placeholder="Enter profile photo URL"
                    />
                </FieldGroup>
            ))}

            <NavigationButtons>
                <Button type="button" onClick={prevStep}>Previous</Button>
                <Button type="submit">Next</Button>
            </NavigationButtons>
        </FormContainer>
    );
};

export default AllPuppiesForm;