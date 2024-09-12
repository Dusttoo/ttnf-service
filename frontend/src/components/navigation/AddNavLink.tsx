import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addNavLink } from '../../store/navigationSlice';
import { Page } from '../../api/types/page';

const AddNavLink: React.FC = () => {
    const pages = useSelector((state: RootState) => state.pages.pages);
    const dispatch: AppDispatch = useDispatch();

    const handleAddLink = (page: Page) => {
        dispatch(addNavLink({
            title: page.name,
            slug: page.slug,
            editable: true,
        }));
    };

    return (
        <div>
            <h2>Add Navigation Link</h2>
            <ul>
                {pages.map(page => (
                    <li key={page.id}>
                        <button onClick={() => handleAddLink(page)}>{page.name}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AddNavLink;