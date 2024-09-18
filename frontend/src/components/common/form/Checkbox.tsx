import React from 'react';
import styled from 'styled-components';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${(props) => (props.checked ? props.theme.colors.primary : 'transparent')};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
  transition: all 150ms;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => (props.checked ? props.theme.colors.primaryDark : props.theme.colors.secondaryBackground)};
  }

  svg {
    visibility: ${(props) => (props.checked ? 'visible' : 'hidden')};
    fill: ${(props) => props.theme.colors.white};
  }
`;

const Label = styled.label`
  margin-left: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
`;

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
  <CheckboxContainer>
    <HiddenCheckbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <StyledCheckbox checked={checked} onClick={() => onChange(!checked)}>
      <svg width="12" height="12" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </StyledCheckbox>
    <Label>{label}</Label>
  </CheckboxContainer>
);

export default Checkbox;