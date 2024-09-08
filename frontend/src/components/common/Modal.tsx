import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px; /* Increase the max-width for a wider modal */
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh; /* Ensure the modal content doesn't overflow the viewport height */
  overflow: auto;
`;

interface GlobalModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const GlobalModal: React.FC<GlobalModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                {children}
            </ModalContent>
        </ModalOverlay>,
        document.getElementById('modal-root')!
    );
};

export default GlobalModal;