import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import LitterForm from '../AddLitter/LitterForm';
import PuppyForm from '../AddLitter/PuppyForm';
import ReviewForm from '../AddLitter/ReviewForm';
import {GenderEnum, StatusEnum } from '../../../../../api/types/core';
import { LitterCreate, LitterUpdate, PuppyCreate } from '../../../../../api/types/breeding';

import { useLitter, useCreateLitter, useUpdateLitter, useAddPuppiesToLitter } from '../../../../../hooks/useLitter';
import Button from '../../../../common/form/Button';
import ProgressIndicator from '../../../../common/form/ProgressIndicator';

const Title = styled.h1`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.colors.primary};
`;

const FormContainer = styled.div`
  background-color: ${(props) => props.theme.colors.white};
  padding: 2rem;
  margin: 1rem auto;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 4px solid ${(props) => (props.theme.colors.primary)};
`;

interface MultiStepFormProps {
    onClose: () => void;
    litterId?: number;
    breedingId?: number;
    parentMaleId?: number;
    parentFemaleId?: number;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ onClose, litterId, breedingId, parentMaleId, parentFemaleId }) => {
    const isEditing = !!litterId;
    const { data: litter, isLoading: litterLoading } = useLitter(litterId ?? 0, { enabled: isEditing });
    const createLitterMutation = useCreateLitter();
    const updateLitterMutation = useUpdateLitter();
    const addPuppiesToLitterMutation = useAddPuppiesToLitter();

    const [currentStep, setCurrentStep] = useState(0);
    const [litterData, setLitterData] = useState<LitterCreate | LitterUpdate>({
        breedingId: breedingId ?? 0,
        birthDate: '',
        numberOfPuppies: 0,
    });
    const [pedigreeUrl, setPedigreeUrl] = useState<string>('');
    const [puppyList, setPuppyList] = useState<PuppyCreate[]>([]);
    const [createdLitterId, setCreatedLitterId] = useState<number | undefined>(undefined);
    const [puppyIndex, setPuppyIndex] = useState(0);

    useEffect(() => {
        if (isEditing && litter && !litterLoading) {
            setLitterData({
                breedingId: litter.breeding.id,
                birthDate: litter.birthDate,
                numberOfPuppies: litter.numberOfPuppies,
            });
            setPedigreeUrl('');
            const puppies = litter.puppies.map((puppy) => ({
                name: puppy.name,
                dob: puppy.dob,
                gender: puppy.gender as GenderEnum,
                status: puppy.status as StatusEnum,
                color: puppy.color,
                description: puppy.description,
                profilePhoto: puppy.profilePhoto,
                parentMaleId: parentMaleId ?? puppy.parentMaleId,
                parentFemaleId: parentFemaleId ?? puppy.parentFemaleId,
                pedigreeLink: puppy.pedigreeLink,
                healthInfos: puppy.healthInfos,
                isProduction: true,
                kennelOwn: true,
            }));
            setPuppyList(puppies);
        }
    }, [isEditing, litter, litterLoading, parentMaleId, parentFemaleId]);

    const handleNextStep = () => {
        if ((litterData.numberOfPuppies ?? 0) && currentStep === 1 && puppyIndex < (litterData.numberOfPuppies ?? 0) - 1) {
            setPuppyIndex((prevIndex) => prevIndex + 1);
        } else if ((litterData.numberOfPuppies ?? 0) && currentStep === 1 && puppyIndex === (litterData.numberOfPuppies ?? 0) - 1) {
            setCurrentStep((prevStep) => prevStep + 1);
        } else {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };
    const handlePrevStep = () => {
        if (currentStep === 1 && puppyIndex > 0) {
            setPuppyIndex((prevIndex) => prevIndex - 1);
        } else {
            setCurrentStep((prevStep) => prevStep - 1);
        }
    };

    const handleLitterSubmit = async (data: LitterCreate | LitterUpdate, pedigreeUrl: string) => {
        setPedigreeUrl(pedigreeUrl);
        if (isEditing) {
            await updateLitterMutation.mutateAsync({ litterId: Number(litterId), litterData: data as LitterUpdate });
        } else {
            const createdLitter = await createLitterMutation.mutateAsync(data as LitterCreate);
            setLitterData((prevState) => ({
                ...prevState,
                breedingId: createdLitter.breeding.id,
                birthDate: createdLitter.birthDate,
                numberOfPuppies: createdLitter.numberOfPuppies,
            }));
            setCreatedLitterId(createdLitter.id);
            handleNextStep();
        }
    };

    const handlePuppySubmit = (puppy: PuppyCreate) => {
        const updatedPuppies = [...puppyList];
        updatedPuppies[puppyIndex] = puppy;
        setPuppyList(updatedPuppies);
        handleNextStep();
    };

    const handleFinalSubmit = async () => {
        const litterIdToUse = isEditing ? litterId : createdLitterId;
        if (litterIdToUse) {
            await addPuppiesToLitterMutation.mutateAsync({ litterId: litterIdToUse, puppies: puppyList });
        }
        onClose();
    };

    const steps = ['Litter Details', 'Puppy Details', 'Review'];

    return (
        <FormContainer>
            <Title>Create Litter</Title>
            <ProgressIndicator steps={steps} currentStep={currentStep} />
            {currentStep === 0 && (
                <LitterForm
                    initialValues={litterData as LitterCreate}
                    onSubmit={handleLitterSubmit}
                    onCancel={onClose}
                    setLitterData={setLitterData}
                />
            )}
            {(litterData.numberOfPuppies ?? 0) > 0 && currentStep === 1 && puppyIndex < (litterData.numberOfPuppies ?? 0) && (
                <PuppyForm
                    onClose={handlePrevStep}
                    defaultValues={puppyList[puppyIndex] || {}}
                    title={`Add Puppy ${puppyIndex + 1}`}
                    onPuppyCreated={handlePuppySubmit}
                    litterData={{ breedingId, pedigreeUrl, birthDate: litterData.birthDate, numberOfPuppies: litterData.numberOfPuppies, parentMaleId, parentFemaleId }}
                    onNextStep={handleNextStep}
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
                <Button onClick={handlePrevStep} disabled={currentStep === 0}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <Button onClick={handleNextStep} disabled={currentStep === 2}>
                    <FontAwesomeIcon icon={faArrowRight} />
                </Button>
            </NavigationButtons>
        </FormContainer>
    );
};

export default MultiStepForm;