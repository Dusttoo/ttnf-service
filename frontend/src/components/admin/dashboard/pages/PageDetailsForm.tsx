import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateExistingPage } from '../../../../features/pageSlice'
import { Page } from '../../../../types';
import { AppDispatch } from '../../../../app/store';

const FormContainer = styled.div`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.ui.button.primary.background};
  color: ${(props) => props.theme.ui.button.primary.color};
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

interface PageDetailsFormProps {
    initialTitle?: string;
    initialSlug?: string;
    page?: Page;
    onSubmit?: (title: string, slug: string) => void;
}

const PageDetailsForm: React.FC<PageDetailsFormProps> = ({ initialTitle = '', initialSlug = '', page, onSubmit }) => {
    const [title, setTitle] = useState(initialTitle);
    const [slug, setSlug] = useState(initialSlug);

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(initialTitle);
        setSlug

            (initialSlug);
    }, [initialTitle, initialSlug]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(title, slug);
        } else if (page) {
            dispatch(updateExistingPage({ id: page.id, pageData: { ...page, title, slug } }));
            navigate('/admin/pages');
        }
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />
                <Input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Slug"
                    required
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    title="Slug should contain only lowercase letters, numbers, and hyphens."
                />
                <Button type="submit">Save</Button>
            </form>
        </FormContainer>
    );
};

export default PageDetailsForm;