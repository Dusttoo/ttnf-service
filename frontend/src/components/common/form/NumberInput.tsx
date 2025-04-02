// src/components/common/form/NumberInput.tsx
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const NumberInputContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  margin-top: 1rem;
  box-sizing: border-box;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.primary};

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.white};
  }
  
  &:disabled {
    cursor: not-allowed;
    color: ${(props) => props.theme.colors.secondaryBackground};
  }
`;

const ValueDisplay = styled.input`
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.white};
  text-align: center;
  border: none;
  outline: none;
  width: 50%;
  background-color: ${(props) => props.theme.colors.neutralBackground};
`;

const LabelText = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.white};
  margin-top: 0.5rem;
  display: block;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ label, value: propValue, onChange: externalOnChange, ...rest }, ref) => {
        // Maintain internal state for the input value.
        const [internalValue, setInternalValue] = React.useState<string>(propValue ? String(propValue) : '');

        // Update internal state if the external value changes.
        React.useEffect(() => {
            setInternalValue(propValue ? String(propValue) : '');
        }, [propValue]);

        const handleIncrement = (e: React.MouseEvent) => {
            e.preventDefault();
            const newValue = Number(internalValue) + 1;
            setInternalValue(newValue.toString());
            if (externalOnChange) {
                externalOnChange({ target: { value: newValue.toString() } } as React.ChangeEvent<HTMLInputElement>);
            }
        };

        const handleDecrement = (e: React.MouseEvent) => {
            e.preventDefault();
            if (Number(internalValue) > 0) {
                const newValue = Number(internalValue) - 1;
                setInternalValue(newValue.toString());
                if (externalOnChange) {
                    externalOnChange({ target: { value: newValue.toString() } } as React.ChangeEvent<HTMLInputElement>);
                }
            }
        };

        return (
            <div>
                <NumberInputContainer>
                    <Button onClick={handleDecrement} disabled={Number(internalValue) <= 0}>
                        <FontAwesomeIcon icon={faMinus} />
                    </Button>
                    <ValueDisplay
                        type="number"
                        value={internalValue}
                        onChange={(e) => {
                            setInternalValue(e.target.value);
                            if (externalOnChange) {
                                externalOnChange(e);
                            }
                        }}
                        ref={ref}
                        {...rest}
                    />
                    <Button onClick={handleIncrement}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </NumberInputContainer>
                {label && <LabelText>{label}</LabelText>}
            </div>
        );
    }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;