import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import usePage from '../../../../../hooks/usePage';
import { updatePageContent } from '../../../../../store/pageSlice';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import PreviewMode from './PreviewMode';
import ToggleButton from './ToggleButton';
import styled from 'styled-components';
import LoadingSpinner from '../../../../common/LoadingSpinner';
import ErrorComponent from '../../../../common/Error';

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.background};
`;

const PageEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { page, loading, error, handleSave } = usePage(id);
    const dispatch = useDispatch();
    const [isEditMode, setIsEditMode] = useState(true);
    const [content, setContent] = useState<string>('');

    useEffect(() => {
        if (page && page.content) {
            setContent(page.content);
        }
    }, [page]);

    const handleSaveContent = () => {
        if (page) {
            dispatch(updatePageContent({ pageId: page.id, content }));
            handleSave();
        }
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <ErrorComponent message={error}/>;

    return (
        <EditorContainer>
            <ContentContainer>
                <ToggleButton
                    isEditMode={isEditMode}
                    onToggle={() => setIsEditMode((prevMode) => !prevMode)}
                />
                {isEditMode ? (
                    <ContentArea content={content} setContent={setContent} />
                ) : (
                    <PreviewMode content={content} />
                )}
                {isEditMode && (
                    <button onClick={handleSaveContent} style={{ marginTop: '20px' }}>
                        Save
                    </button>
                )}
            </ContentContainer>
            <Sidebar />
        </EditorContainer>
    );
};

export default PageEditor;