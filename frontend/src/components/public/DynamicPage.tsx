import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getPageBySlug, updatePage } from '../../api/pageApi';
import { Page } from '../../api/types/page';
import DOMPurify from 'dompurify';
import ContentArea from '../admin/dashboard/pages/editor/ContentArea'; 

interface DynamicPageProps {
    slug?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug: initialSlug }) => {
    const { slug: routeSlug } = useParams<{ slug: string }>();
    const slug = initialSlug || routeSlug;
    const [page, setPage] = useState<Page | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const isEditMode = useSelector((state: RootState) => state.editMode.isEditMode);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                if (!slug) return;
                const fetchedPage = await getPageBySlug(slug);
                setPage(fetchedPage);
                setEditContent(fetchedPage.content); 
            } catch (error) {
                console.error('Error fetching page:', error);
                setPage(null);
            }
        };

        fetchPage();
    }, [slug]);

    const handleSave = async () => {
        if (page) {
            try {
                await updatePage(page.id, { ...page, content: editContent }); 
                alert('Page updated successfully');
            } catch (error) {
                console.error('Error updating page:', error);
            }
        }
    };

    if (!page) return <div>Loading...</div>;

    return (
        <div>
            <h1>{page.name}</h1>
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