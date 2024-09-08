import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import store from './app/store';
import { theme } from './theme/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { QueryClientProvider } from 'react-query';
import queryClient from './api/queryClient';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);