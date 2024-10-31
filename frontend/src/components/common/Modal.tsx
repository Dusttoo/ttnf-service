import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useModal } from '../../context/ModalContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75); // Darker overlay for more contrast
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.secondaryBackground}; // Dark modal background
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); // Slightly stronger shadow for better contrast
  max-height: 90vh;
  overflow: auto;
  color: ${(props) => props.theme.colors.white}; // Light text for readability
`;

const GlobalModal: React.FC = () => {
    const { closeModal, modalContent, isOpen } = useModal();
    console.log('in modal: ', isOpen, modalContent);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [closeModal, isOpen]);

    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                {modalContent}
            </ModalContent>
        </ModalOverlay>,
        document.getElementById('modal-root')!,
    );
};

export default GlobalModal;