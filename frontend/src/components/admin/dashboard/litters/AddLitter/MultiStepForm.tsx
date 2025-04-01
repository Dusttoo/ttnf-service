import React, { useState } from 'react';
import styled from 'styled-components';
import { FormProvider } from '../../../../../context/FormContext';
import AllPuppiesForm from './AllPuppiesForm';
import LitterForm from './LitterForm';
import ReviewForm from './ReviewForm';

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.primary};
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  margin: 2rem auto;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

export const Button = styled.button`
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

const MultiStepForm: React.FC = () => {
  // Local state only to track which step is active.
  const [currentStep, setCurrentStep] = useState<number>(0);

  // A helper to render the active step.
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LitterForm
            nextStep={() => setCurrentStep(1)}
          />
        );
      case 1:
        return (
          <AllPuppiesForm
            nextStep={() => setCurrentStep(2)}
            prevStep={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <ReviewForm
            prevStep={() => setCurrentStep(1)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider>
      <FormContainer>
        {renderStep()}
      </FormContainer>
    </FormProvider>
  );
};

export default MultiStepForm;