// src/components/admin/dashboard/litters/AddLitter/ReviewForm.tsx
import React from 'react';
import styled from 'styled-components';
import { useFormContext } from '../../../../../context/FormContext';

const ReviewContainer = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
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

interface ReviewFormProps {
  prevStep: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ prevStep }) => {
  const { litterData, puppyData } = useFormContext();

  const handleSubmit = () => {
    console.log('Final submission:', { litterData, puppyData });
    alert('Submission successful!');
  };

  return (
    <ReviewContainer>
      <h2>Review Your Submission</h2>
      <Section>
        <h3>Litter Details</h3>
        <p>
          <strong>Breeding ID:</strong> {litterData.breedingId}
        </p>
        <p>
          <strong>Birth Date:</strong>{' '}
          {litterData.birthDate
            ? new Date(litterData.birthDate + "T00:00:00").toLocaleDateString()
            : 'N/A'}
        </p>
        <p>
          <strong>Number of Puppies:</strong> {litterData.numberOfPuppies}
        </p>
        <p>
          <strong>Pedigree URL:</strong> {litterData.pedigreeUrl}
        </p>
      </Section>

      <Section>
        <h3>Puppy Details</h3>
        {puppyData.length > 0 ? (
          puppyData.map((puppy, index) => (
            <div key={index}>
              <p>
                <strong>Puppy {index + 1}:</strong>
              </p>
              <p>Name: {puppy.name || '-'}</p>
              <p>Gender: {puppy.gender || '-'}</p>
              <p>Date of Birth: {puppy.dob || '-'}</p>
              <p>Profile Photo URL: {puppy.profilePhoto || '-'}</p>
            </div>
          ))
        ) : (
          <p>No puppy data available.</p>
        )}
      </Section>

      <NavigationButtons>
        <Button type="button" onClick={prevStep}>
          Previous
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Submit All
        </Button>
      </NavigationButtons>
    </ReviewContainer>
  );
};

export default ReviewForm;