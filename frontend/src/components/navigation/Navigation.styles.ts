import styled from 'styled-components';

export const NavContainer = styled.nav`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 1rem;
    
    @media (min-width: 768px) {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
`;

export const NavList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.primary};

    @media (min-width: 768px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
    }
`;

export const NavItem = styled.li<{ isChild?: boolean }>`
    margin: 0.5rem 0;
    position: relative;
    overflow: visible;

    @media (min-width: 768px) {
        margin: 0.5rem 1rem;
    }

    @media (max-width: 768px) {
        padding: 0.5rem 0;
        font-size: 1rem;
        border-bottom: ${({ isChild, theme }) => (isChild ? 'none' : `1px solid ${theme.colors.white}`)};
    }
`;


export const NavLinkStyled = styled.a`
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem;
    display: block;
    &:hover {
        color: ${({ theme }) => theme.colors.secondary};
    }

    @media (max-width: 768px) {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.white};
        padding: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
`;

export const MobileMenuButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.white};
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 768px) {
        display: none;
    }
`;

export const MobileMenu = styled.div<{ open: boolean }>`
    display: ${({ open }) => (open ? 'flex' : 'none')};
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.primary};
    position: absolute;
    top: 150px;
    right: 0;
    width: 75%;
    padding: 1rem;
    z-index: 10;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

    @media (min-width: 768px) {
        display: none;
    }
`;

export const DesktopMenu = styled.div`
    display: none;

    @media (min-width: 768px) {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
`;

export const CloseButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.white};
    font-size: 1.5rem;
    align-self: flex-end;
    cursor: pointer;
    margin-bottom: 1rem;
`;

export const NavItemWrapper = styled.div`
    position: relative; /* Ensure dropdown is positioned relative to NavItemWrapper */
    display: inline-block; /* Keep the NavItem and SubNavList together */
`;

export const SubNavList = styled.ul<{ open: boolean }>`
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    width: max-content;
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    list-style: none;
    z-index: 10;

    @media (max-width: 768px) {
        position: static;
        padding: 5px;
        border: none;
        box-shadow: none;
        padding-left: 15px;
    }
`;

export const CaretIcon = styled.span`
    margin-left: 5px;
    font-size: 1rem;
    vertical-align: middle;
    @media (max-width: 768px) {
        font-size: 1.2rem;
    }
`;

export const SubNavLinkStyled = styled(NavLinkStyled)`
    background-color: ${({ theme }) => theme.colors.secondaryBackground}; 
    color: ${({ theme }) => theme.colors.primary}; 
    border: 2px solid ${({ theme }) => theme.colors.primary}; 

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary}; 
        color: ${({ theme }) => theme.colors.white}; 
    }
`;