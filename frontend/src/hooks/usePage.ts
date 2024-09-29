import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPageBySlug, updateExistingPage } from '../store/pageSlice';
import { RootState, AppDispatch } from '../store';

const usePage = (slug: string | undefined) => {
    const dispatch: AppDispatch = useDispatch();
    const page = useSelector((state: RootState) => state.pages.pages.find(p => p.slug === slug));
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    useEffect(() => {
        if (!slug || page) {
            setLoading(false);
            return;
        }

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
    }, [slug, dispatch, page]);

    const handleSave = async (updatedPage: any) => {
        if (page) {
          try {
            await dispatch(updateExistingPage({ id: page.id, pageData: updatedPage })).unwrap();
            setModalMessage('Page updated successfully!');
          } catch (error) {
            setError(`Failed to update the page: ${error && error}`);
            setModalMessage('Failed to update the page.');
          } finally {
            setIsModalOpen(true);
          }
        }
      };

    return { page, loading, error, handleSave, modalMessage, isModalOpen, setIsModalOpen, setModalMessage };
};

export default usePage;