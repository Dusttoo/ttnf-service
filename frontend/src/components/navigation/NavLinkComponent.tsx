import React from 'react';
import { NavLink } from '../../api/types/navigation';
import { NavItem, NavLinkStyled } from './Navigation.styles';

interface NavLinkProps {
    link: NavLink;
}

const NavLinkComponent: React.FC<NavLinkProps> = ({ link }) => {
    return (
        <NavItem>
            <NavLinkStyled href={`/${link.slug}`}>
                {link.title}
            </NavLinkStyled>
            {link.subLinks && link.subLinks.length > 0 && (
                <ul>
                    {link.subLinks.map(subLink => (
                        <NavItem key={subLink.id}>
                            <NavLinkStyled href={`/${subLink.slug}`}>
                                {subLink.title}
                            </NavLinkStyled>
                        </NavItem>
                    ))}
                </ul>
            )}
        </NavItem>
    );
};

export default NavLinkComponent;