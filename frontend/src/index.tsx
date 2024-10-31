import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import store from './store';
import { theme } from './theme/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { QueryClientProvider } from 'react-query';
import queryClient from './api/queryClient';
import { ModalProvider } from './context/ModalContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);

root.render(
    <React.StrictMode>
        <ModalProvider>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <GlobalStyle />
                        <App />
                    </ThemeProvider>
                </Provider>
            </QueryClientProvider>
        </ModalProvider>
    </React.StrictMode>,
);