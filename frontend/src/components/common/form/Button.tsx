import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'error';
    onClick?: () => void;
    disabled?: boolean;
    children: any;
    type?: 'button' | 'submit' | 'reset';
}

const StyledButton = styled.button<ButtonProps>`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => {
        switch (props.variant) {
            case 'secondary':
                return props.theme.ui.button.secondary.background;
            case 'error':
                return props.theme.colors.error;
            default:
                return props.theme.ui.button.primary.background;
        }
    }};
  color: ${(props) => {
        switch (props.variant) {
            case 'secondary':
            case 'error':
                return props.theme.colors.white;
            default:
                return props.theme.ui.button.primary.color;
        }
    }};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => {
        switch (props.variant) {
            case 'secondary':
                return props.theme.colors.accent;
            case 'error':
                return props.theme.colors.errorHover;
            default:
                return props.theme.colors.primary;
        }
    }};
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.secondaryBackground};
    cursor: not-allowed;
  }
`;

const Button: React.FC<ButtonProps> = ({ variant = 'primary', onClick, disabled, children, type = 'button' }) => {
    return (
        <StyledButton variant={variant} onClick={onClick} disabled={disabled} type={type}>
            {children}
        </StyledButton>
    );
};

export default Button;