import React, { useState } from 'react';
import { NavLink } from '../../api/types/navigation';
import { NavItemWrapper, NavItem, NavLinkStyled, SubNavList, CaretIcon } from './Navigation.styles';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';  

interface NavLinkProps {
    link: NavLink;
}

const NavLinkComponent: React.FC<NavLinkProps> = ({ link }) => {
    const [isOpen, setIsOpen] = useState(false); 

    const handleMouseEnter = () => {
        if (window.innerWidth > 768) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth > 768) {
            setIsOpen(false);
        }
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        if (link.subLinks && link.subLinks.length > 0) {
            e.preventDefault(); // Prevent navigation for parent items
            setIsOpen(!isOpen);
        }
    };

    return (
        <NavItemWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <NavItem isChild={false}>
                <NavLinkStyled
                    href={link.subLinks && link.subLinks.length > 0 ? undefined : `/${link.slug}`}
                    onClick={handleToggleClick}
                    role={link.subLinks && link.subLinks.length > 0 ? 'button' : undefined}
                    aria-haspopup={link.subLinks && link.subLinks.length > 0 ? "true" : undefined}
                >
                    {link.title}
                    {link.subLinks && link.subLinks.length > 0 && (
                        <CaretIcon>
                            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </CaretIcon>
                    )}
                </NavLinkStyled>
            </NavItem>
            {link.subLinks && link.subLinks.length > 0 && (
                <SubNavList open={isOpen}>
                    {link.subLinks.map(subLink => (
                        <NavItem key={subLink.id} isChild={true}>
                            <NavLinkStyled href={`/${subLink.slug}`}>
                                {subLink.title}
                            </NavLinkStyled>
                        </NavItem>
                    ))}
                </SubNavList>
            )}
        </NavItemWrapper>
    );
};

export default NavLinkComponent;