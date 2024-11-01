import React from 'react';
import styled from 'styled-components';
import Button from './Button'; 

const CloseButtonContainer = styled.div`
  margin-top: 1rem;
  text-align: right;
`;

interface ModalContentWithCloseButtonProps {
  onClose: () => void;
  closeButtonLabel?: string;
  closeButtonChildren?: React.ReactNode;
  children: React.ReactNode;
}

const ModalContentWithCloseButton: React.FC<ModalContentWithCloseButtonProps> = ({
  onClose,
  closeButtonLabel = 'Close',
  closeButtonChildren,
  children,
}) => {
  return (
    <div>
      <CloseButtonContainer>
        <Button $variant="primary" onClick={onClose}>
          {closeButtonChildren ? closeButtonChildren : closeButtonLabel}
        </Button>
      </CloseButtonContainer>
      {children}

    </div>
  );
};

export default ModalContentWithCloseButton;
