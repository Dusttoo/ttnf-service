// SideDrawer.tsx
import React from 'react';
import styled from 'styled-components';

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
  background: ${({ theme }) => theme.colors.secondaryBackground};
  transition: width 0.3s ease;
  box-shadow: ${({ $isOpen }) => ($isOpen ? '-2px 0px 5px rgba(0,0,0,0.3)' : 'none')};
  overflow-x: hidden;
  z-index: 10001;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  cursor: pointer;
`;

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, children }) => {
    console.log('side drawer is open: ', isOpen, children);
    return (
        <>
            {isOpen && (
                <DrawerOverlay $isOpen={isOpen}>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                    {children}
                </DrawerOverlay>
            )}
        </>
    );
};

export default SideDrawer;