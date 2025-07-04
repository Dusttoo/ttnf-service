import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ProductionCreate, ProductionUpdate } from '../../../../api/types/dog';
import { useProduction, useCreateProduction, useUpdateProduction } from '../../../../hooks/useProduction';
import Button from '../../../common/form/Button';
import ImageUpload from '../../../common/ImageUpload';
import ParentSelector from '../../../common/form/ParentSelector';
import { GenderEnum } from '../../../../api/types/core';
import Input from '../../../common/Input';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.white};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.white};
`;

const Dropdown = styled.select`
  padding: 0.5rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
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

interface ProductionFormProps {
  onClose: () => void;
  productionId?: number;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ onClose, productionId }) => {
  const { data: production } = useProduction(productionId || 0);
  const createProduction = useCreateProduction();
  const updateProduction = useUpdateProduction();

  const [formState, setFormState] = useState<ProductionCreate | ProductionUpdate>({
    name: '',
    dob: '',
    profilePhoto: '',
    gender: undefined,
    owner: '',
    description: '',
    parentMaleId: undefined,
    parentFemaleId: undefined,
  });

  useEffect(() => {
    if (production) {
      setFormState({
        ...production,
        dob: production.dob,
        parentMaleId: production.parentMaleId,
        parentFemaleId: production.parentFemaleId,
        gender: production.gender,
        description: production.description || '',
        owner: production.owner || '',
      });
    }
  }, [production]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleProfilePhotoChange = async (urls: string[]) => {
    setFormState((prevState) => ({ ...prevState, profilePhoto: urls[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedFormState = { ...formState, dob: formState.dob ? new Date(formState.dob).toISOString() : null };
  
    try {
      if (productionId) {
        await updateProduction.mutateAsync({
          productionId: Number(productionId),
          productionData: updatedFormState as ProductionUpdate,
        });
      } else {
        await createProduction.mutateAsync(updatedFormState as ProductionCreate);
      }
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        console.error(error.response.data.detail);
      } else {
        console.error("an unexpected error occurred");
      }
    }
  };

  return (
    <FormContainer>
      <h1>{productionId ? 'Edit Production' : 'Add New Production'}</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          value={formState.name ? formState.name : ''}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <Input
          type="date"
          name="dob"
          value={formState.dob ? formState.dob : ''}
          onChange={handleChange}
          placeholder="Date of Birth"
        />
        <Dropdown
          name="gender"
          value={formState.gender}
          onChange={(e) => setFormState({ ...formState, gender: e.target.value as GenderEnum })}
        >
          <option value="">Select Gender</option>
          <option value={GenderEnum.Male}>Male</option>
          <option value={GenderEnum.Female}>Female</option>
        </Dropdown>
        <Input
          type="text"
          name="owner"
          value={formState.owner ? formState.owner : ''}
          onChange={handleChange}
          placeholder="Owner"
          required
        />
        <Input
          type="text"
          name="description"
          value={formState.description ? formState.description : ''}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <ParentSelector
          sireId={formState.parentMaleId}
          damId={formState.parentFemaleId}
          onSireChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              parentMaleId: parseInt(e.target.value, 10) || undefined,
            }))
          }
          onDamChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              parentFemaleId: parseInt(e.target.value, 10) || undefined,
            }))
          }
        />
        <InputGroup>
          <p>Select 1 profile image</p>
          <ImageUpload
            id="profile"
            maxImages={1}
            onImagesChange={handleProfilePhotoChange}
            singleImageMode
            initialImages={formState.profilePhoto ? [formState.profilePhoto] : []}
          />
        </InputGroup>
        <ButtonContainer>
          <Button $variant="primary" type="submit">
            Save
          </Button>
          <Button $variant="error" onClick={onClose}>
            Cancel
          </Button>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default ProductionForm;