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
    background-color: ${({ theme }) => theme.colors.primary}; /* Matches the nav background */

    @media (min-width: 768px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
`;

export const NavItem = styled.li`
    margin: 0.5rem 0;
    position: relative;
    border-radius: 8px; 
    
    @media (min-width: 768px) {
        margin: 0.5rem 1rem;
    }
    @media (max-width: 768px) {
        padding: 0.5rem 0;
        border-bottom: 1px solid ${({ theme }) => theme.colors.white}; // Add bottom borders
        font-size: 1rem;
    }
`;


export const NavLinkStyled = styled.a`
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem;
    display: block;
    &:hover {
        color: ${({ theme }) => theme.colors.accent};
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

export const SubNavList = styled.ul<{ open: boolean }>`
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    list-style: none;
    z-index: 10;
    transition: max-height 0.3s ease, opacity 0.3s ease-in-out;
    visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
    opacity: ${({ open }) => (open ? '1' : '0')};
    max-height: ${({ open }) => (open ? '200px' : '0')};

    @media (max-width: 768px) {
        position: static;
        padding: 5px 0;
        border: none;
        box-shadow: none;
        max-height: ${({ open }) => (open ? 'none' : '0')};
        padding-left: 15px; // Indent sub-links
        background-color: ${({ theme }) => theme.colors.accent}; // Different color for sub-menu
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
    color: ${({ theme }) => theme.colors.primary}; /* Orange text for sub-links */
    border: 2px solid ${({ theme }) => theme.colors.primary}; /* Orange border for sub-links */

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary}; /* Accent color on hover */
        color: ${({ theme }) => theme.colors.white}; /* White text on hover */
    }
`;