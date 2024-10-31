import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.white};
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  color: ${(props) => props.theme.colors.white};

  ::placeholder {
    color: ${(props) => props.theme.colors.neutralBackground};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

interface DateInputProps {
    label: string;
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDateChange = (date: Date | null) => {
        setIsOpen(false);
        onChange(date);
    };

    return (
        <DateInputContainer>
            <Label>{label}</Label>
            <StyledDatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM / dd / yyyy"
                placeholderText="MM / DD / YYYY"
                onClickOutside={() => setIsOpen(false)}
                open={isOpen}
                onFocus={() => setIsOpen(true)}
                wrapperClassName="date-picker-wrapper"
                popperClassName="date-picker-popper"
            />
        </DateInputContainer>
    );
};

export default DateInput;