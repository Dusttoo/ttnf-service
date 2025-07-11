import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isOpen: boolean;
    modalContent: ReactNode | null;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    };

    const closeModal = () => {
        setModalContent(null);
        setIsOpen(false);
    };

    return (
        <ModalContext.Provider value={{ isOpen, modalContent, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};