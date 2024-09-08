import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/pageApi';
import { Page } from '../types';

interface PublicPageProps {
    slug?: string;
}

const PublicPage: React.FC<PublicPageProps> = ({ slug: initialSlug }) => {
    const { slug: routeSlug } = useParams<{ slug: string }>();
    const slug = initialSlug || routeSlug;
    const [page, setPage] = useState<Page | null>(null);
    const [jsonContent, setJsonContent] = useState<any>(null);

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) return;
            const fetchedPage = await getPageBySlug(slug);
            setPage(fetchedPage);

            if (fetchedPage && fetchedPage.content) {
                try {
                    const parsedContent = JSON.parse(fetchedPage.content);
                    setJsonContent(parsedContent);
                } catch (error) {
                    console.error("Failed to parse page content:", error);
                }
            }
        };

        fetchPage();
    }, [slug]);

    if (!page) return <div>Loading...</div>;

    return (
        <div>
            <h1>{page.title}</h1>
        </div>
    );
};

export default PublicPage;