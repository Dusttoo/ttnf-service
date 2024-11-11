import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import LitterForm from '../AddLitter/LitterForm';
import PuppyForm from '../AddLitter/PuppyForm';
import ReviewForm from '../AddLitter/ReviewForm';
import { GenderEnum, StatusEnum } from '../../../../../api/types/core';
import {
  LitterCreate,
  LitterUpdate,
  PuppyCreate,
} from '../../../../../api/types/breeding';
import {
  useLitter,
  useCreateLitter,
  useUpdateLitter,
  useAddPuppiesToLitter,
} from '../../../../../hooks/useLitter';
import Button from '../../../../common/form/Button';
import ProgressIndicator from '../../../../common/form/ProgressIndicator';

const Title = styled.h1`
  font-family: ${(props) => props.theme.fonts.secondary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.primaryText};
`;

const FormContainer = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  padding: 2rem;
  margin: 1rem auto;
  border-radius: 8px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid ${(props) => props.theme.colors.border};
`;

interface MultiStepFormProps {
  onClose: () => void;
  litterId?: number;
  breedingId?: number;
  parentMaleId?: number;
  parentFemaleId?: number;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  onClose,
  litterId,
  breedingId,
  parentMaleId,
  parentFemaleId,
}) => {
  const isEditing = !!litterId;
  const { data: litter, isLoading: litterLoading } = useLitter(litterId ?? 0, {
    enabled: isEditing,
  });
  const createLitterMutation = useCreateLitter();
  const updateLitterMutation = useUpdateLitter();
  const addPuppiesToLitterMutation = useAddPuppiesToLitter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [litterData, setLitterData] = useState<LitterCreate | LitterUpdate>({
    breedingId: breedingId ?? 0,
    birthDate: '',
    numberOfPuppies: 0,
  });
  const [pedigreeUrl, setPedigreeUrl] = useState<string>('');
  const [puppyList, setPuppyList] = useState<PuppyCreate[]>([]);
  const [createdLitterId, setCreatedLitterId] = useState<number | undefined>(
    undefined
  );
  const [puppyIndex, setPuppyIndex] = useState(0);

  useEffect(() => {
    if (isEditing && litter && !litterLoading) {
      setLitterData({
        breedingId: litter.breeding.id,
        birthDate: litter.birthDate,
        numberOfPuppies: litter.numberOfPuppies,
      });
      setPedigreeUrl(litter.pedigreeUrl || '');
      setPuppyList(
        litter.puppies.map((puppy) => ({
          ...puppy,
          parentMaleId: parentMaleId ?? puppy.parentMaleId,
          parentFemaleId: parentFemaleId ?? puppy.parentFemaleId,
        }))
      );
    }
  }, [isEditing, litter, litterLoading, parentMaleId, parentFemaleId]);

  const handleNextStep = async () => {
    console.log(`Handling step: ${currentStep}`);
    switch (currentStep) {
      case 0: {
            console.log('submitting step 0');
          setCurrentStep(1);
        break;
      }
      case 1: {
        console.log('submitting step 1, puppyIndex:', puppyIndex);
          if (puppyIndex < (litterData.numberOfPuppies ?? 0)) {
            console.log('updating puppy index');
            setPuppyIndex((prevIndex) => prevIndex + 1); 
            console.log('handling next puppy');
          } else {
            console.log('handling final submit');
            setCurrentStep(2); 
            setPuppyIndex(0); 
          }
        break;
      }
      case 2: {
        await handleFinalSubmit();
        break;
      }
      default:
        break;
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1 && puppyIndex > 0) {
      setPuppyIndex((prevIndex) => prevIndex - 1);
    } else {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const handleLitterSubmit = async (
    data: LitterCreate | LitterUpdate,
    pedigreeUrl: string
  ) => {
    console.log('submitting step 1');
    setPedigreeUrl(pedigreeUrl);

    try {
      if (isEditing) {
        await updateLitterMutation.mutateAsync({
          litterId: Number(litterId),
          litterData: data as LitterUpdate,
        });
      } else {
        const createdLitter = await createLitterMutation.mutateAsync(
          data as LitterCreate
        );
        setCreatedLitterId(createdLitter.id);
        setLitterData({
          ...litterData,
          breedingId: createdLitter.breeding.id,
          birthDate: createdLitter.birthDate,
          numberOfPuppies: createdLitter.numberOfPuppies,
        });
        if(createdLitterId) {
            handleNextStep();
        }
      }
      return true;
    } catch (error) {
      console.error('Error submitting litter:', error);
      return false;
    }
  };

  const handlePuppySubmit = async () => {
    const currentPuppy = puppyList[puppyIndex];
    if (!currentPuppy) return false;

    setPuppyList((prevList) => {
      const newList = [...prevList];
      newList[puppyIndex] = currentPuppy;
      return newList;
    });
    handleNextStep()
    return true;
  };

  const handleFinalSubmit = async () => {
    const litterIdToUse = isEditing ? litterId : createdLitterId;
    if (!litterIdToUse) return;

    try {
      await addPuppiesToLitterMutation.mutateAsync({
        litterId: litterIdToUse,
        puppies: puppyList,
      });
      alert('Litter and puppies successfully saved!');
      onClose();
    } catch (error) {
      console.error('Error saving puppies:', error);
      alert('Failed to save puppies.');
    }
  };

  const steps = ['Litter Details', 'Puppy Details', 'Review'];

  return (
    <FormContainer>
      <Title>{isEditing ? 'Edit Litter' : 'Create Litter'}</Title>
      <ProgressIndicator steps={steps} currentStep={currentStep} />
      {currentStep === 0 && (
        <LitterForm
          initialValues={litterData as LitterCreate}
          onSubmit={handleLitterSubmit}
          onCancel={onClose}
          setLitterData={setLitterData}
        />
      )}
      {(litterData.numberOfPuppies ?? 0) > 0 &&
        currentStep === 1 &&
        puppyIndex < (litterData.numberOfPuppies ?? 0) && (
          <PuppyForm
            onClose={handlePrevStep}
            defaultValues={puppyList[puppyIndex] || {}}
            title={`Add Puppy ${puppyIndex + 1}`}
            onPuppyCreated={handlePuppySubmit}
            litterData={{
              breedingId,
              pedigreeUrl,
              birthDate: litterData.birthDate,
              numberOfPuppies: litterData.numberOfPuppies,
              parentMaleId,
              parentFemaleId,
            }}
            onNextStep={handleNextStep}
            isPartOfMultiStep
            key={puppyIndex}
          />
        )}
      {currentStep === 2 && (
        <ReviewForm
          litterData={litterData as LitterCreate}
          puppyList={puppyList}
          onSubmit={handleFinalSubmit}
          onCancel={handlePrevStep}
        />
      )}
      <NavigationButtons>
        <Button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={currentStep === 2}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </Button>
      </NavigationButtons>
    </FormContainer>
  );
};

export default MultiStepForm;
