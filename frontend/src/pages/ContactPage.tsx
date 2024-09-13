import React from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import usePage from '../hooks/usePage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorComponent from '../components/common/Error';
import styled from 'styled-components';

export const ContactContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background-color: ${({ theme }) => theme.colors.neutralBackground};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const ContactHeader = styled.h1`
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContactContent = styled.div`
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};
`;

export const ContactInfo = styled.div`
    text-align: center;
    margin-bottom: 2rem;

    h3 {
        font-size: 1.8rem;
        color: ${({ theme }) => theme.colors.primary};
    }

    p {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.text};
    }
`;

export const ContactForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

export const InputField = styled.input`
    padding: 0.75rem;
    font-size: 1.1rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const TextArea = styled.textarea`
    padding: 0.75rem;
    font-size: 1.1rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    font-size: 1.2rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: ${({ theme }) => theme.colors.secondary};
    }
`;

const ContactPage: React.FC<{ slug?: string }> = ({ slug }) => {
    const { page, loading, error } = usePage(slug);


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorComponent message={error} />;
    if (!page) return <ErrorComponent message={"Content not found"} />

    const sanitizedContent = DOMPurify.sanitize(page.content);

    return (
        <ContactContainer>
            <ContactHeader>Contact Us</ContactHeader>
            <ContactContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            <ContactInfo>
                <h3>We’d love to hear from you!</h3>
                <p>Please use the form below to reach out to us with any questions or inquiries.</p>
            </ContactInfo>
            <ContactForm>
                <InputField type="text" placeholder="Your Name" required />
                <InputField type="email" placeholder="Your Email" required />
                <TextArea placeholder="Your Message" rows={5} required />
                <SubmitButton>Send Message</SubmitButton>
            </ContactForm>
        </ContactContainer>
    );
};

export default ContactPage;