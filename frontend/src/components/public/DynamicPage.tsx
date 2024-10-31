import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getPageBySlug, updatePage } from '../../api/pageApi';
import { Page } from '../../api/types/page';
import DOMPurify from 'dompurify';
import ContentArea from '../admin/dashboard/pages/editor/ContentArea';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorComponent from '../common/Error';

interface DynamicPageProps {
    slug?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug: initialSlug }) => {
    const { slug: routeSlug } = useParams<{ slug: string }>();
    const slug = initialSlug || routeSlug;
    const [page, setPage] = useState<Page | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const isEditMode = useSelector((state: RootState) => state.editMode.isEditMode);
    console.log('dynamic page');
    useEffect(() => {
        const fetchPage = async () => {
            try {
                setError(null);
                if (!slug) return;
                const fetchedPage = await getPageBySlug(slug);
                setPage(fetchedPage);
                setEditContent(fetchedPage.content);
            } catch (error) {
                setError((error as Error).message || 'Failed to load the page');
                setPage(null);
            }
        };

        fetchPage();
    }, [slug]);

    const handleSave = async () => {
        if (page) {
            try {
                setError(null);
                await updatePage(page.id, { ...page, content: editContent });
                alert('Page updated successfully');
            } catch (error) {
                setError((error as Error).message || 'Failed to save the page');
            }
        }
    };

    if (error) {
        return <ErrorComponent message={error} />;
    }

    if (!page) {
        return <LoadingSpinner />;
    }

    const showTitle = page.customValues?.showTitle !== false;

    return (
        <div>
            {showTitle && <h1>{page.name}</h1>}
            {isEditMode ? (
                <div>
                    <ContentArea content={editContent} setContent={setEditContent} />
                    <button onClick={handleSave}>Save</button>
                </div>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />
            )}
        </div>
    );
};

export default DynamicPage;