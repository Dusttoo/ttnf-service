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

    @media (min-width: 768px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
`;

export const NavItem = styled.li`
    margin: 0.5rem 0;

    @media (min-width: 768px) {
        margin: 0.5rem 1rem;
    }
`;

export const NavLinkStyled = styled.a`
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
    font-size: 1rem;

    &:hover {
        color: ${({ theme }) => theme.colors.accent};
    }

    @media (min-width: 768px) {
        font-size: 1.2rem;
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
    width: 50%;
    padding: 1rem;
    z-index: 10;

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