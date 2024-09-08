import styled from 'styled-components';

export const StatusBadge = styled.span<{ color: string }>`
  background-color: ${(props) => props.color};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
`;