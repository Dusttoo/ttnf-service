import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPage from '../components/public/DynamicPage';
import { fetchPages } from '../store/pageSlice';
import { AppDispatch, RootState } from '../store';
import PublicPage from '../pages/PublicPage';
import Layout from '../theme/Layout';
import Login from '../components/auth/Login';
import MalesPage from '../pages/dogs/MalesPage'; 
import FemalesPage from '../pages/dogs/FemalesPage'; 
import BreedingsPage from '../pages/dogs/BreedingPage'; 
import DogDetailPage from '../components/dogs/DogDetail';
import ProductionsPage from '../pages/dogs/ProductionsPage'; 
import LitterPage from '../pages/dogs/LittersPage';

const PublicRoutes = () => {
    const dispatch: AppDispatch = useDispatch();
    const { pages } = useSelector((state: RootState) => state.pages);

    useEffect(() => {
        dispatch(fetchPages());
    }, [dispatch]);

    const pageComponentMap: { [key: string]: React.FC } = {
        males: MalesPage,
        females: FemalesPage,
        breedings: BreedingsPage,
        litters: LitterPage,
        productions: ProductionsPage,
    };

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<PublicPage slug="landing" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dogs/:id" element={<DogDetailPage/>} />

                {pages.map((page) => {
                    const Component = pageComponentMap[page.slug] || DynamicPage; 

                    return (
                        <Route
                            key={page.id}
                            path={`/${page.slug}`}
                            element={<Component />} 
                        />
                    );
                })}
            </Route>
        </Routes>
    );
};

export default PublicRoutes;