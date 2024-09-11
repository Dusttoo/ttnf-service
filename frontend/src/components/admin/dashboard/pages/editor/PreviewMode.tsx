import React from 'react';
import DOMPurify from 'dompurify';

interface PreviewModeProps {
    content: string;
}

const PreviewMode: React.FC<PreviewModeProps> = ({ content }) => {
    const sanitizedContent = DOMPurify.sanitize(content); // Sanitize the HTML
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

export default PreviewMode;