import React from 'react';
import styled from 'styled-components';
import Button from './Button';

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const CTAButton: React.FC<CTAButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
}) => {
  return (
    <Button variant={variant} onClick={onClick}>
      {label}
    </Button>
  );
};

export default CTAButton;
