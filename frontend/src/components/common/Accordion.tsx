import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

const AccordionContainer = styled.div`
  border: 1px solid ${(props) => props.theme.colors.primary};
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: ${(props) => props.theme.colors.secondaryBackground};

  @media (max-width: 768px) {
    margin: 0.5rem 0;  /* Reduce margin for more compact stacking */
  }
`;

const AccordionHeader = styled.div`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.secondary};
  border-radius: 8px 8px 0 0;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.text};
  }

  @media (max-width: 768px) {
    padding: 0.8rem;  /* Reduce padding for mobile */
    font-size: 0.9rem; /* Adjust font size for smaller screens */
  }
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${(props) => (props.isOpen ? 'none' : '0')};
  overflow: hidden;
  transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
  padding: ${(props) => (props.isOpen ? '1rem' : '0')};
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  color: ${(props) => props.theme.colors.text};
  border-radius: 0 0 8px 8px;

  @media (max-width: 768px) {
    padding: ${(props) => (props.isOpen ? '0.5rem' : '0')};  /* Compact padding for mobile */
  }
`;

interface AccordionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
                                                 title,
                                                 children,
                                                 defaultOpen = false,
                                             }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <AccordionContainer>
            <AccordionHeader onClick={() => setIsOpen(!isOpen)}>
                <span>{title}</span>
                <span>{isOpen ? '-' : '+'}</span>
            </AccordionHeader>
            <AccordionContent isOpen={isOpen}>{children}</AccordionContent>
        </AccordionContainer>
    );
};

export default Accordion;