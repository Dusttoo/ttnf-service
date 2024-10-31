import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { selectIsLoading } from '../store/loadingSlice';
import { validateSession } from '../store/authSlice';
import AdminLayout from '../theme/AdminLayout';
import DogManager from '../components/admin/dashboard/dogs/DogManager';
import PageList from '../components/admin/dashboard/pages/PageList';
import DogDetail from '../components/admin/dashboard/dogs/DogDetail';
import AdminProductionList from '../components/admin/dashboard/productions/ProductionList';
import AdminBreedingList from '../components/admin/dashboard/breedings/BreedingList';
import AdminLitterList from '../components/admin/dashboard/litters/LitterList';
import LitterPuppies from '../components/admin/dashboard/litters/LitterPuppies';
import PageEditor from '../components/admin/dashboard/pages/editor/PageEditor';
import Landing from '../components/admin/dashboard/Landing';
import NotFoundPage from '../pages/404';
import AdminSettings from '../components/admin/dashboard/settings/AdminSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface PrivateRouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
    const dispatch: AppDispatch = useDispatch();
    const { user, error, sessionValidated } = useSelector((state: RootState) => state.auth);
    const isLoading = useSelector(selectIsLoading);

    if (isLoading || (!user && !sessionValidated)) {
        return <LoadingSpinner />;
    }

    if (!user && sessionValidated) {
        return <Navigate to="/login" />;
    }

    return element;
};

const PrivateRoutes: React.FC = () => (
    <Routes>
        <Route
            path="/dashboard"
            element={<PrivateRoute element={<AdminLayout />} />}
        >
            <Route path="" element={<Landing />} />
            <Route path="pages" element={<PageList />} />
            <Route path="pages/edit/:id" element={<PageEditor />} />
            <Route path="dogs" element={<DogManager />} />
            <Route path="dogs/:dogId" element={<DogDetail />} />
            <Route path="productions" element={<AdminProductionList />} />
            <Route path="breedings" element={<AdminBreedingList />} />
            <Route path="litters" element={<AdminLitterList />} />
            <Route path="litters/:litterId/puppies" element={<LitterPuppies />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    </Routes>
);

export default PrivateRoutes;