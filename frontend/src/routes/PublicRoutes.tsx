import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPage from '../components/public/DynamicPage';
import { fetchPages } from '../store/pageSlice';
import { AppDispatch, RootState } from '../store';
import PublicPage from '../pages/PublicPage';
import Layout from '../theme/Layout';
import Login from '../components/auth/Login';

const PublicRoutes = () => {
    const dispatch: AppDispatch = useDispatch();
    const { pages } = useSelector((state: RootState) => state.pages);
    
    useEffect(() => {
        dispatch(fetchPages());
    }, [dispatch]);

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<PublicPage slug="landing" />} />
                <Route path="/login" element={<Login />} />
                {pages.map((page) => (
                    <Route key={page.id} path={`/${page.slug}`} element={<DynamicPage />} />
                ))}
            </Route>
        </Routes>
    );
};

export default PublicRoutes;