import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/pageApi';
import { Page } from '../api/types/page';
import DOMPurify from 'dompurify';  

interface PublicPageProps {
    slug?: string;
}

const PublicPage: React.FC<PublicPageProps> = ({ slug: initialSlug }) => {
    const { slug: routeSlug } = useParams<{ slug: string }>();
    const slug = initialSlug || routeSlug;
    const [page, setPage] = useState<Page | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) return;
            const fetchedPage = await getPageBySlug(slug);
            setPage(fetchedPage);
        };

        fetchPage();
    }, [slug]);

    if (!page) return <div>Loading...</div>;

    // Sanitize the HTML content to avoid XSS vulnerabilities
    const sanitizedContent = DOMPurify.sanitize(page.content);

    return (
        <div>
            <h1>{page.name}</h1>
            {/* Render the sanitized HTML content */}
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>
    );
};

export default PublicPage;