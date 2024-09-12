import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchNavLinks, addNavLink, removeNavLink, updateExistingNavLink } from '../../store/navigationSlice';
import { NavLink } from '../../api/types/navigation';
import NavLinkManagement from './NavLinkManagement';

const NavigationManagement: React.FC = () => {
    const links = useSelector((state: RootState) => state.navigation.links);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchNavLinks());
    }, [dispatch]);

    const handleAddLink = (newLink: Partial<NavLink>) => {
        dispatch(addNavLink(newLink));
    };

    const handleRemoveLink = (id: number) => {
        dispatch(removeNavLink(id));
    };

    const handleUpdateLink = (updatedLink: NavLink) => {
        dispatch(updateExistingNavLink(updatedLink));
    };

    return (
        <div>
            <h2>Manage Navigation</h2>
            <ul>
                {links.map(link => (
                    <NavLinkManagement
                        key={link.id}
                        link={link}
                        onRemove={handleRemoveLink}
                        onUpdate={handleUpdateLink}
                    />
                ))}
            </ul>
            <button onClick={() => handleAddLink({ title: 'New Link', slug: 'new-link', editable: true, position: 0 })}>Add Link</button>
        </div>
    );
};

export default NavigationManagement;