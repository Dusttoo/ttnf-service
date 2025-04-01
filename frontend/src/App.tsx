import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import LoadingSpinner from './components/common/LoadingSpinner';
import PrivateRoutes from './routes/PrivateRoutes';
import PublicRoutes from './routes/PublicRoutes';
import { AppDispatch } from './store';
import { validateSession } from './store/authSlice';
import { theme } from './theme/theme';

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(validateSession());
    }, [dispatch]);

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ThemeProvider theme={theme}>
                <Router>
                    <Routes>
                        <Route path="/admin/*" element={<PrivateRoutes />} />
                        <Route path="/*" element={<PublicRoutes />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </Suspense>
    );
};

export default App;
