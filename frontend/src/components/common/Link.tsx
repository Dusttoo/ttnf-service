import styled from 'styled-components';

export const LinkComponent = styled.a`
  color: ${(props) => props.theme.colors.primary};
  &:hover {
    color: ${(props) => props.theme.colors.text};
  }
`;
