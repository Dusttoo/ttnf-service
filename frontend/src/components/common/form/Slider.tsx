import React from 'react';
import styled from 'styled-components';

const SliderContainer = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.secondary};
`;

const Input = styled.input`
  width: 100%;
`;

interface SliderProps {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, value, onChange }) => {
    return (
        <SliderContainer>
            <Label>{label}</Label>
            <Input type="range" min={min} max={max} value={value} onChange={onChange} />
        </SliderContainer>
    );
};

export default Slider;