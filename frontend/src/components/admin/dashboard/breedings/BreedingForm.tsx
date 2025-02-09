import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BreedingCreate, BreedingUpdate } from '../../../../api/types/breeding';
import { useBreedingById, useCreateBreeding, useUpdateBreeding } from '../../../../hooks/useBreeding';
import Button from '../../../common/form/Button';
import CharacterCounter from '../../../common/form/CharacterCounter';
import DateInput from '../../../common/form/DateInput';
import FieldFeedback from '../../../common/form/FieldFeedback';
import ParentSelector from '../../../common/form/ParentSelector';

const MAX_DESCRIPTION_LENGTH = 2500;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.white};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.white};
`;

const BreedingForm: React.FC<{ onClose: () => void; breedingId?: number }> = ({ onClose, breedingId }) => {
    const navigate = useNavigate();
    const { data: breeding, isLoading: isBreedingLoading } = useBreedingById(breedingId);
    const createBreedingMutation = useCreateBreeding();
    const updateBreedingMutation = useUpdateBreeding();

    const [useManualSire, setUseManualSire] = useState(false);
    const [formState, setFormState] = useState<BreedingCreate | BreedingUpdate>({
        femaleDogId: 0,
        maleDogId: 0,
        breedingDate: '',
        expectedBirthDate: '',
        description: '',
        manualSireName: '',
        manualSireColor: '',
        manualSireImageUrl: '',
        manualSirePedigreeLink: '',
    });

    const [errors, setErrors] = useState<{
        breedingDate?: string;
        expectedBirthDate?: string;
        manualSireName?: string
        description?: string
    }>({});

    useEffect(() => {
        if (breedingId && breeding) {
            setFormState({
                ...breeding,
                breedingDate: breeding.breedingDate ? new Date(breeding.breedingDate).toISOString().split('T')[0] : '',
                expectedBirthDate: breeding.expectedBirthDate ? new Date(breeding.expectedBirthDate).toISOString().split('T')[0] : '',
            });
        }
    }, [breedingId, breeding]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleDateChange = (name: 'breedingDate' | 'expectedBirthDate', date: Date | null) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: date ? date.toISOString().split('T')[0] : '',
        }));

        if (name === 'breedingDate' && date) {
            const expectedDate = new Date(date);
            expectedDate.setDate(expectedDate.getDate() + 63); 
            setFormState((prevState) => ({
                ...prevState,
                expectedBirthDate: expectedDate.toISOString().split('T')[0],
            }));
        }
    };

    const validate = () => {
        const newErrors: { description?: string; femaleDogId?: string; maleDogId?: string; breedingDate?: string; expectedBirthDate?: string } = {};
        if (!formState.femaleDogId) newErrors.femaleDogId = 'Female dog is required.';
        if (!formState.maleDogId) newErrors.maleDogId = 'Male dog is required.';
        if (!formState.breedingDate) newErrors.breedingDate = 'Breeding date is required.';
        if (!formState.expectedBirthDate) newErrors.expectedBirthDate = 'Expected birth date is required.';
        if (!formState.description) newErrors.description = 'Description is required.';
        if (formState.description && formState.description.length > 2500) newErrors.description = 'Description cannot exceed 2500 characters.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const breedingData = {
            ...formState,
            breedingDate: formState.breedingDate ? formState.breedingDate : null,
            expectedBirthDate: formState.expectedBirthDate ? formState.expectedBirthDate : null,
            maleDogId: useManualSire ? undefined : formState.maleDogId, 
        };
    
        if (breedingId) {
            await updateBreedingMutation.mutateAsync({
                breedingId: Number(breedingId),
                breedingData: breedingData as BreedingUpdate,
            });
        } else {
            await createBreedingMutation.mutateAsync(breedingData as BreedingCreate);
        }
        onClose();
        navigate('/admin/dashboard/breedings');
    };


    return (
        <FormContainer>
            <h1>{breedingId ? 'Edit Breeding' : 'Add New Breeding'}</h1>
            <Form onSubmit={handleSubmit}>
                <ParentSelector
                    sireId={formState.maleDogId}
                    damId={formState.femaleDogId}
                    onSireChange={(e) => setFormState((prevState) => ({
                        ...prevState,
                        maleDogId: Number(e.target.value),
                    }))}
                    onDamChange={(e) => setFormState((prevState) => ({
                        ...prevState,
                        femaleDogId: Number(e.target.value),
                    }))}
                    disabled={useManualSire}
                />
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={useManualSire}
                            onChange={() => setUseManualSire((prev) => !prev)}
                        />
                        Use Manual Sire
                    </label>
                </div>

                {useManualSire && (
                    <>
                        <Input
                            type="text"
                            name="manualSireName"
                            value={formState.manualSireName}
                            onChange={handleChange}
                            placeholder="Manual Sire Name"
                        />
                        {errors.manualSireName && <FieldFeedback message={errors.manualSireName} />}
                        <Input
                            type="text"
                            name="manualSireColor"
                            value={formState.manualSireColor}
                            onChange={handleChange}
                            placeholder="Manual Sire Color"
                        />
                        <Input
                            type="text"
                            name="manualSireImageUrl"
                            value={formState.manualSireImageUrl}
                            onChange={handleChange}
                            placeholder="Manual Sire Image URL"
                        />
                        <Input
                            type="text"
                            name="manualSirePedigreeLink"
                            value={formState.manualSirePedigreeLink}
                            onChange={handleChange}
                            placeholder="Manual Sire Pedigree Link"
                        />
                    </>
                )}

                <div>
                    <DateInput
                        label="Breeding Date"
                        selectedDate={formState.breedingDate ? new Date(formState.breedingDate) : null}
                        onChange={(date) => handleDateChange('breedingDate', date)}
                    />
                        {errors.breedingDate && <FieldFeedback message={errors.breedingDate} />}

                </div>
                <div>
                    <DateInput
                        label="Expected Birth Date"
                        selectedDate={formState.expectedBirthDate ? new Date(formState.expectedBirthDate) : null}
                        onChange={(date) => handleDateChange('expectedBirthDate', date)}
                    
                    />
                </div>
                <Input
                    type="text"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    placeholder="Description"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <CharacterCounter currentLength={formState.description ? formState.description.length : 0} maxLength={MAX_DESCRIPTION_LENGTH} />
                        {errors.description && <FieldFeedback message={errors.description} />}

                <ButtonContainer>
                    <Button $variant="primary" type="submit">Save</Button>
                    <Button $variant="error" onClick={onClose}>Cancel</Button>
                </ButtonContainer>
            </Form>
        </FormContainer>
    );
};

export default BreedingForm;
