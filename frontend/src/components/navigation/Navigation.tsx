import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { NavContainer, NavList, NavItem, NavLinkStyled, MobileMenuButton, MobileMenu, DesktopMenu, CloseButton } from './Navigation.styles';
import { FaBars, FaTimes } from 'react-icons/fa';
import NavLinkComponent from './NavLinkComponent';
import { fetchNavLinks } from '../../features/navigationSlice';

const Navigation: React.FC = () => {
    const links = useSelector((state: RootState) => state.navigation.links);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchNavLinks());
    }, [dispatch]);


    const handleToggleMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleCloseMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
            setMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen]);

    return (
        <NavContainer>
            <MobileMenuButton onClick={handleToggleMenu}>
                {!mobileMenuOpen && <FaBars />}
            </MobileMenuButton>
            <MobileMenu ref={mobileMenuRef} open={mobileMenuOpen}>
                <CloseButton onClick={handleCloseMenu}>
                    <FaTimes />
                </CloseButton>
                <NavList>
                    {links.map(link => (
                       <NavLinkComponent key={link.id} link={link}/>
                    ))}
                </NavList>
            </MobileMenu>
            <DesktopMenu>
                <NavList>
                    {links.map(link => (
                        <NavLinkComponent key={link.id} link={link} />
                    ))}
                </NavList>
            </DesktopMenu>
        </NavContainer>
    );
};

export default Navigation;