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
import NotFoundPage from "../pages/404";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorComponent from "../components/common/Error";

const PublicRoutes = () => {
    const dispatch: AppDispatch = useDispatch();
    const { pages, status } = useSelector((state: RootState) => state.pages);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchPages());
        }
    }, [dispatch, status]);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (status === 'failed') {
        return <ErrorComponent message={"Something went wrong. Please try again"} />;
    }

    const pageComponentMap: { [key: string]: React.FC<{ slug?: string }> } = {
        males: MalesPage,
        females: FemalesPage,
        breedings: BreedingsPage,
        litters: LitterPage,
        productions: ProductionsPage,
        about: AboutPage,
        contact: ContactPage
    };

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<PublicPage slug="landing" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dogs/:id" element={<DogDetailPage />} />

                {pages.map((page) => {
                    const Component = pageComponentMap[page.slug] || DynamicPage;

                    return (
                        <Route
                            key={page.id}
                            path={`/${page.slug}`}
                            element={<Component slug={page.slug} />}
                        />
                    );
                })}

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default PublicRoutes;