import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    $variant: 'primary' | 'secondary';
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  background-color: ${(props) => props.theme.colors[props.$variant]};
  color: ${(props) => props.theme.colors.white};
  border: none;
  padding: 10px 20px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};  // Change cursor when disabled
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};  // Adjust opacity when disabled
  &:hover {
    opacity: ${(props) => (props.disabled ? 0.6 : 0.8)};  // Adjust hover opacity when disabled
  }
`;

const Button: React.FC<ButtonProps> = ({ $variant, onClick, children, disabled = false }) => {
    return (
        <StyledButton
            $variant={$variant}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {children}
        </StyledButton>
    );
};

export default Button;