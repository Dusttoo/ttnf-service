import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from '../components/auth/Login';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DogDetailPage from '../components/dogs/DogDetail';
import DynamicPage from '../components/public/DynamicPage';
import NotFoundPage from '../pages/404';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import AvailablePage from '../pages/dogs/AvailablePage';
import BreedingsPage from '../pages/dogs/BreedingPage';
import FemalesPage from '../pages/dogs/FemalesPage';
import LitterPuppiesPage from '../pages/dogs/LitterPuppiesPage';
import LitterPage from '../pages/dogs/LittersPage';
import MalesPage from '../pages/dogs/MalesPage';
import ProductionsPage from '../pages/dogs/ProductionsPage';
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/services/ServicesPage';
import { AppDispatch, RootState } from '../store';
import { selectIsLoading } from '../store/loadingSlice';
import { fetchPages } from '../store/pageSlice';
import Layout from '../theme/Layout';

const PublicRoutes = () => {
    const dispatch: AppDispatch = useDispatch();
    const { pages } = useSelector((state: RootState) => state.pages);
    const isLoading = useSelector(selectIsLoading);
    const location = useLocation();

    useEffect(() => {
        if (pages.length === 0) {
            dispatch(fetchPages());
        }
    }, [dispatch, pages.length]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Get the current page’s ID based on the route
    const currentPage = pages.find(page => `/${page.slug}` === location.pathname);
    const pageId = currentPage?.id;

    const pageComponentMap: { [key: string]: React.FC<{ slug?: string }> } = {
        males: MalesPage,
        females: FemalesPage,
        breedings: BreedingsPage,
        litters: LitterPage,
        productions: ProductionsPage,
        about: AboutPage,
        contact: ContactPage,
        services: ServicesPage,
        available: AvailablePage
    };

    console.log(pages, currentPage)

    return (
        <Routes>
            <Route path="/" element={<Layout pageId={pageId ?? ''} />}>
                <Route path="/landing" element={<HomePage />} />
                <Route path="/home" element={<Navigate to="/landing" />} />
                <Route path="/" element={<Navigate to="/landing" />} />
                <Route path="/cgi-sys/defaultwebpage.cgi" element={<Navigate to="/landing" />} />

                <Route path="/login" element={<Login />} />
                <Route path="/dogs/:name" element={<DogDetailPage />} />
                <Route path="/males/:name" element={<DogDetailPage />} />
                <Route path="/females/:name" element={<DogDetailPage />} />
                <Route path="/litters/:litterId/puppies" element={<LitterPuppiesPage />} />

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