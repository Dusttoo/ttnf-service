import React from 'react';
import { NavLink } from '../../types';

interface NavLinkManagementProps {
    link: NavLink;
    onRemove: (id: string) => void;
    onUpdate: (link: NavLink) => void;
}

const NavLinkManagement: React.FC<NavLinkManagementProps> = ({ link, onRemove, onUpdate }) => {
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...link, title: e.target.value });
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...link, slug: e.target.value });
    };

    return (
        <li>
            <input type="text" value={link.title} onChange={handleTitleChange} />
            <input type="text" value={link.slug} onChange={handleSlugChange} />
            {link.editable && <button onClick={() => onRemove(link.id)}>Remove</button>}
        </li>
    );
};

export default NavLinkManagement;