import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/pageApi';
import { Page } from '../api/types/page';
import DOMPurify from 'dompurify';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

    if (!page) return <LoadingSpinner />;

    const sanitizedContent = DOMPurify.sanitize(page.content);
    const showTitle = page.customValues?.showTitle !== false;

    return (
        <div>
            {showTitle && <h1>{page.name}</h1>}
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>
    );
};

export default PublicPage;