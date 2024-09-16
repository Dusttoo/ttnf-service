import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

export const LinkComponent = styled(RouterLink)`
  color: ${(props) => props.theme.colors.primary};  /* Primary color from your theme */
  text-decoration: none;  /* Remove default underline */
  font-weight: 600;  /* Make the link bold or use theme font weight */
  font-family: ${(props) => props.theme.fonts.primary};  /* Use primary theme font */
  padding: 0.5rem 0;  
  border-radius: 4px;  /* Rounded corners for a cleaner look */
  background-color: ${(props) => props.theme.colors.secondaryBackground};  /* Background from theme */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* Optional shadow to give depth */

  &:hover {
    color: ${(props) => props.theme.colors.primaryDark};  /* Change color on hover */
    text-decoration: underline;  /* Add underline on hover */
    background-color: ${(props) => props.theme.colors.primaryLight};  /* Lighten the background on hover */
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;  /* Smooth transition */
  }

  &:active {
    background-color: ${(props) => props.theme.colors.primary};  /* Darken on click */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);  /* Enhance shadow on click */
  }
`;

