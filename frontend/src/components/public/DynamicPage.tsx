import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { getPageBySlug } from '../../api/pageApi';
import { Page, Block } from '../../types';

interface DynamicPageProps {
    slug?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug: initialSlug }) => {
    const { slug: routeSlug } = useParams<{ slug: string }>();
    const slug = initialSlug || routeSlug;
    const [page, setPage] = useState<Page | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const isEditMode = useSelector((state: RootState) => state.editMode.isEditMode);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                if (!slug) return;
                const fetchedPage = await getPageBySlug(slug);
                setPage(fetchedPage);

                // Parse the content into blocks
                if (fetchedPage?.content) {
                    const parsedContent: Block[] = JSON.parse(fetchedPage.content);
                    setBlocks(parsedContent || []);
                }
            } catch (error) {
                console.error('Error fetching page:', error);
                setPage(null);
            }
        };

        fetchPage();
    }, [slug]);

    if (!page) return <div>Loading...</div>;
    if (!blocks.length) return <div>No content available.</div>;

    return (
        <div>
            <h1>{page.title}</h1>
        </div>
    );
};

export default DynamicPage;