import React from 'react';
import styled from 'styled-components';

const Counter = styled.div<{ exceeded: boolean }>`
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  text-align: right;
  color: ${(props) => (props.exceeded ? props.theme.colors.error : props.theme.colors.primary)};
`;

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ currentLength, maxLength }) => {
  const remaining = maxLength - currentLength;
  return <Counter exceeded={remaining < 0}>{remaining} characters remaining</Counter>;
};

export default CharacterCounter;