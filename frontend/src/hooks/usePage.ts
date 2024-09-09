import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPageBySlug, updateExistingPage } from '../store/pageSlice';
import { RootState, AppDispatch } from '../store';

const usePage = (slug: string | undefined) => {
    const dispatch: AppDispatch = useDispatch();
    const page = useSelector((state: RootState) => state.pages.pages.find(p => p.slug === slug));
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchPage = async () => {
            setLoading(true);
            try {
                await dispatch(fetchPageBySlug(slug)).unwrap();
                setError(null);
            } catch (err) {
                setError('Failed to fetch page');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug, dispatch]);

    const handleSave = async () => {
        if (page) {
            try {
                await dispatch(updateExistingPage({ id: page.id, pageData: page })).unwrap();
                alert('Page saved!');
                setError(null);
            } catch (err) {
                setError('Failed to save page');
            }
        }
    };

    return { page, loading, error, handleSave };
};

export default usePage;