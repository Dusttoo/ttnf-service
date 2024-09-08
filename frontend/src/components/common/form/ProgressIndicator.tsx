import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ isActive: boolean }>`
  width: 100%;
  padding: 0.5rem;
  border-bottom: 4px solid ${(props) => (props.isActive ? props.theme.colors.primary : props.theme.colors.secondaryBackground)};
  color: ${(props) => (props.isActive ? props.theme.colors.primary : props.theme.colors.secondaryBackground)};
  text-align: center;
`;

interface ProgressIndicatorProps {
    steps: string[];
    currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
    return (
        <ProgressContainer>
            {steps.map((step, index) => (
                <Step key={index} isActive={index <= currentStep}>
                    {step}
                </Step>
            ))}
        </ProgressContainer>
    );
};

export default ProgressIndicator;