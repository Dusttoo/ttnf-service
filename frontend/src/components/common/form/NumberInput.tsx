import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
}

const NumberInputContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 4px;
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.white};
`;

const Button = styled.button`
    background-color: ${(props) => props.theme.colors.white};
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1.25rem;
    color: ${(props) => props.theme.colors.primary};
    
    &:hover {
        background-color: ${(props) => props.theme.colors.secondaryBackground};
    }
    
    &:disabled {
        cursor: not-allowed;
        color: ${(props) => props.theme.colors.secondaryBackground};
    }
`;

const ValueDisplay = styled.input`
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    color: ${(props) => props.theme.colors.primary};
    text-align: center;
    border: none;
    outline: none;
    width: 50%;
`;

const Label = styled.span`
    font-size: 0.875rem;
    color: ${(props) => props.theme.colors.secondary};
    margin-top: 0.5rem;
    display: block;
    text-align: center;
`;

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, label }) => {
    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange(value + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        if (value > 0) {
            onChange(value - 1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        onChange(isNaN(newValue) ? 0 : newValue);
    };

    return (
        <div>
            <NumberInputContainer>
                <Button onClick={handleDecrement} disabled={value <= 0}><FontAwesomeIcon icon={faMinus} /></Button>
                <ValueDisplay type="number" value={value} onChange={handleChange} />
                <Button onClick={handleIncrement}><FontAwesomeIcon icon={faPlus} /></Button>
            </NumberInputContainer>
            {label && <Label>{label}</Label>}
        </div>
    );
};

export default NumberInput;