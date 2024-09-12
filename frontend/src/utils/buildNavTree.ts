import { NavLink } from "../api/types/navigation";
export const buildNavTree = (navLinks: NavLink[]): NavLink[] => {
    const linkMap: { [key: number]: NavLink } = {};
    const rootLinks: NavLink[] = [];

    navLinks.forEach(link => {
        link.subLinks = []; 
        linkMap[link.id] = link;
    });

    
    navLinks.forEach(link => {
        if (link.parentId) {
            const parent = linkMap[link.parentId];
            if (parent) {
                parent.subLinks = parent.subLinks || []; 
                parent.subLinks.push(link);
            }
        } else {
            rootLinks.push(link); 
        }
    });

    return rootLinks; 
};