import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Roboto:wght@400;700&display=swap');
  body {
    margin: 0;
    font-family: ${(props) => props.theme.fonts.primary};
    background-color: ${(props) => props.theme.colors.neutralBackground};
    color: ${(props) => props.theme.colors.text};
    height: 100%;
    font-family: 'Roboto', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Oswald', sans-serif;
  }
  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;
  }
`;