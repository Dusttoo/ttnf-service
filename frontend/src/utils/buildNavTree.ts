import { NavLink } from "../api/types/navigation";
export const buildNavTree = (navLinks: NavLink[]): NavLink[] => {
    const linkMap: { [key: number]: NavLink } = {};
    const rootLinks: NavLink[] = [];

    // Create a map of links by id
    navLinks.forEach(link => {
        link.subLinks = []; // Initialize subLinks as an empty array
        linkMap[link.id] = link;
    });

    // Loop through links and attach subLinks to their parent
    navLinks.forEach(link => {
        if (link.parentId) {
            const parent = linkMap[link.parentId];
            if (parent) {
                parent?.subLinks.push(link);
            }
        } else {
            rootLinks.push(link); // No parent means it's a root link
        }
    });

    return rootLinks; // Return the tree structure starting from root links
};