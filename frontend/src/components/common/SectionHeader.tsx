// SectionHeader.tsx
import React from 'react';
import styled from 'styled-components';

interface SectionHeaderProps {
  title: string;
}

const Header = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 0.75rem;
`;

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return <Header>{title}</Header>;
};

export default SectionHeader;