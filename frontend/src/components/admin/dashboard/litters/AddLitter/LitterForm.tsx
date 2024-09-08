import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { LitterCreate, LitterUpdate } from '../../../../../types';
import styled from 'styled-components';
import Button from '../../../../common/form/Button';
import FieldFeedback from '../../../../common/form/FieldFeedback';
import NumberInput from '../../../../common/form/NumberInput';
import DateInput from '../../../../common/form/DateInput';

interface LitterFormProps {
    initialValues: LitterCreate | LitterUpdate;
    onSubmit: (data: LitterCreate | LitterUpdate, pedigreeUrl: string) => Promise<void>;
    onCancel: () => void;
    setLitterData?: React.Dispatch<React.SetStateAction<LitterCreate | LitterUpdate>>;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const LitterForm: React.FC<LitterFormProps> = ({ initialValues, onSubmit, onCancel, setLitterData }) => {
    const [formState, setFormState] = useState<LitterCreate | LitterUpdate>({
        ...initialValues,
        description: typeof initialValues.description === 'string' ? { content: initialValues.description } : initialValues.description || { content: '' }
    });
    const [errors, setErrors] = useState<{ birthDate?: string; numberOfPuppies?: string }>({});
    const [pedigreeUrl, setPedigreeUrl] = useState<string>(initialValues.pedigreeUrl || '');

    useEffect(() => {
        if (setLitterData) {
            setLitterData(formState);
        }
    }, [formState, setLitterData]);

    const handleDateChange = (date: Date | null) => {
        setFormState((prevState) => ({ ...prevState, birthDate: date ? date.toISOString().split('T')[0] : '' }));
    };

    const handleNumberChange = (value: number) => {
        setFormState((prevState) => ({ ...prevState, numberOfPuppies: value }));
    };

    const handlePedigreeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPedigreeUrl(e.target.value);
    };

    const validate = () => {
        const newErrors: { birthDate?: string; numberOfPuppies?: string } = {};
        if (!formState.birthDate) {
            newErrors.birthDate = 'Birth Date is required.';
        }
        if (formState.numberOfPuppies && formState.numberOfPuppies <= 0) {
            newErrors.numberOfPuppies = 'Number of Puppies must be greater than zero.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSubmit(formState, pedigreeUrl);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div>
                <DateInput
                    label="Birth Date"
                    selectedDate={formState.birthDate ? new Date(formState.birthDate) : null}
                    onChange={handleDateChange}
                />
                {errors.birthDate && <FieldFeedback message={errors.birthDate} />}
            </div>
            <div>
                <Input
                    type="text"
                    name="pedigreeUrl"
                    value={pedigreeUrl}
                    onChange={handlePedigreeUrlChange}
                    placeholder="Pedigree URL"
                />
            </div>
            <div>
                <NumberInput
                    value={formState.numberOfPuppies ? formState.numberOfPuppies : 0}
                    onChange={handleNumberChange}
                    label="Number of Puppies" />
                {errors.numberOfPuppies && <FieldFeedback message={errors.numberOfPuppies} />}
            </div>
            <div>
                {/* <EditableDescription
                    description={formState.description || { content: '' }}
                /> */}
            </div>
            <ButtonContainer>
                <Button variant="error" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type='submit'>
                    Save Litter
                </Button>
            </ButtonContainer>
        </Form>
    );
};

export default LitterForm;