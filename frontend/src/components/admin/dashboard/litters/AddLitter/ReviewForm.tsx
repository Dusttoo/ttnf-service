import React from 'react';
import styled from 'styled-components';
import { LitterCreate, PuppyCreate } from '../../../../../types';

interface ReviewFormProps {
    litterData: LitterCreate;
    puppyList: PuppyCreate[];
    onSubmit: () => void;
    onCancel: () => void;
}

const ReviewContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
    background-color: ${(props) => props.theme.colors.white};
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InfoContainer = styled.div`
    background-color: ${(props) => props.theme.colors.secondaryBackground};
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const Title = styled.h1`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.colors.primary};
`;

const SubTitle = styled.h2`
    font-family: ${(props) => props.theme.fonts.secondary};
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: ${(props) => props.theme.colors.primary};
`;

const PuppyInfo = styled.div`
    background-color: ${(props) => props.theme.colors.neutralBackground};
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

interface ButtonProps {
    variant?: 'primary' | 'secondary';
}

const Button = styled.button<ButtonProps>`
    padding: 0.75rem 1.5rem;
    background-color: ${(props) => (props.variant === 'secondary' ? props.theme.ui.button.secondary.background : props.theme.ui.button.primary.background)};
    color: ${(props) => (props.variant === 'secondary' ? props.theme.ui.button.secondary.color : props.theme.ui.button.primary.color)};
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: ${(props) => (props.variant === 'secondary' ? props.theme.colors.accent : props.theme.colors.primary)};
    }

    &:disabled {
        background-color: ${(props) => props.theme.colors.secondaryBackground};
        cursor: not-allowed;
    }
`;

const ReviewForm: React.FC<ReviewFormProps> = ({ litterData, puppyList, onSubmit, onCancel }) => {
    return (
        <ReviewContainer>
            <Title>Review Litter and Puppies</Title>
            <InfoContainer>
                <SubTitle>Litter Information</SubTitle>
                <p>Breeding ID: {litterData.breedingId}</p>
                <p>Birth Date: {litterData.birthDate}</p>
                <p>Number of Puppies: {litterData.numberOfPuppies}</p>
            </InfoContainer>
            <InfoContainer>
                <SubTitle>Puppy Information</SubTitle>
                {puppyList.map((puppy, index) => (
                    <PuppyInfo key={index}>
                        <h3>Puppy {index + 1}</h3>
                        <p>Name: {puppy.name}</p>
                        <p>Date of Birth: {puppy.dob}</p>
                        <p>Gender: {puppy.gender}</p>
                        <p>Status: {puppy.status}</p>
                        <p>Color: {puppy.color}</p>
                        <p>Description: {puppy.description}</p>
                    </PuppyInfo>
                ))}
            </InfoContainer>
            <ButtonContainer>
                <Button onClick={onSubmit}>Submit</Button>
                <Button onClick={onCancel} variant="secondary">Cancel</Button> {/* Add cancel button */}
            </ButtonContainer>
        </ReviewContainer>
    );
};

export default ReviewForm;